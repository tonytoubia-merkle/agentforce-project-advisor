/**
 * QuoteService - Invocable Apex action for Agentforce
 * Generates formal quotes for B2B customers
 */
public with sharing class QuoteService {

    public class QuoteRequest {
        @InvocableVariable(label='products' description='JSON array of products for quote' required=true)
        public String products;

        @InvocableVariable(label='deliveryAddress' description='Delivery address for the order')
        public String deliveryAddress;

        @InvocableVariable(label='requestedDate' description='Requested delivery date')
        public String requestedDate;

        @InvocableVariable(label='contactId' description='Contact ID for the customer')
        public String contactId;
    }

    public class QuoteResponse {
        @InvocableVariable(label='quoteId' description='Generated quote ID')
        public String quoteId;

        @InvocableVariable(label='quoteTotal' description='Total quote amount')
        public Decimal quoteTotal;

        @InvocableVariable(label='quoteUrl' description='URL to view/accept quote')
        public String quoteUrl;

        @InvocableVariable(label='outputSuccess' description='True if quote generated successfully')
        public Boolean outputSuccess;

        @InvocableVariable(label='outputError' description='Error message if quote generation failed')
        public String outputError;
    }

    @InvocableMethod(
        label='Generate Quote'
        description='Generates a formal quote for B2B customers'
        category='Agentforce'
    )
    public static List<QuoteResponse> generateQuote(List<QuoteRequest> requests) {
        List<QuoteResponse> responses = new List<QuoteResponse>();

        for (QuoteRequest req : requests) {
            QuoteResponse res = new QuoteResponse();

            try {
                // Parse products JSON
                List<Object> productList = (List<Object>) JSON.deserializeUntyped(req.products);

                if (productList.isEmpty()) {
                    res.outputSuccess = false;
                    res.outputError = 'No products provided for quote';
                    responses.add(res);
                    continue;
                }

                // Calculate total from products
                Decimal total = 0;
                for (Object prod : productList) {
                    Map<String, Object> product = (Map<String, Object>) prod;
                    if (product.containsKey('price')) {
                        Object priceObj = product.get('price');
                        if (priceObj instanceof Decimal) {
                            total += (Decimal) priceObj;
                        } else if (priceObj instanceof Integer) {
                            total += (Integer) priceObj;
                        } else if (priceObj instanceof Double) {
                            total += Decimal.valueOf((Double) priceObj);
                        }
                    }
                    // Apply quantity if present
                    if (product.containsKey('quantity')) {
                        Object qtyObj = product.get('quantity');
                        Integer qty = 1;
                        if (qtyObj instanceof Integer) {
                            qty = (Integer) qtyObj;
                        }
                        // Multiply last added price by (qty - 1) since we already added once
                        if (qty > 1 && product.containsKey('price')) {
                            Object priceObj = product.get('price');
                            Decimal price = 0;
                            if (priceObj instanceof Decimal) {
                                price = (Decimal) priceObj;
                            } else if (priceObj instanceof Integer) {
                                price = (Integer) priceObj;
                            } else if (priceObj instanceof Double) {
                                price = Decimal.valueOf((Double) priceObj);
                            }
                            total += price * (qty - 1);
                        }
                    }
                }

                // Apply bulk discount (10% for quotes)
                Decimal discount = total * 0.10;
                total = total - discount;

                // Create Quote record (using Opportunity as proxy if Quote object not available)
                Opportunity quote = new Opportunity();
                quote.Name = 'Quote - ' + DateTime.now().format('yyyy-MM-dd HH:mm');
                quote.StageName = 'Proposal/Price Quote';
                quote.CloseDate = Date.today().addDays(30);
                quote.Amount = total;
                quote.Description = 'Products: ' + req.products;

                if (String.isNotBlank(req.deliveryAddress)) {
                    quote.Description += '\nDelivery Address: ' + req.deliveryAddress;
                }

                if (String.isNotBlank(req.requestedDate)) {
                    quote.Description += '\nRequested Date: ' + req.requestedDate;
                }

                // Set Account from Contact if available
                if (String.isNotBlank(req.contactId)) {
                    List<Contact> contacts = [SELECT AccountId FROM Contact WHERE Id = :req.contactId LIMIT 1];
                    if (!contacts.isEmpty() && contacts[0].AccountId != null) {
                        quote.AccountId = contacts[0].AccountId;
                    }
                }

                // For demo: use a default account if none found
                if (quote.AccountId == null) {
                    List<Account> defaultAccounts = [SELECT Id FROM Account WHERE Name = 'B2B Customer' LIMIT 1];
                    if (!defaultAccounts.isEmpty()) {
                        quote.AccountId = defaultAccounts[0].Id;
                    } else {
                        // Create a default B2B account
                        Account b2bAccount = new Account(Name = 'B2B Customer');
                        insert b2bAccount;
                        quote.AccountId = b2bAccount.Id;
                    }
                }

                insert quote;

                // Generate quote URL
                String baseUrl = URL.getOrgDomainUrl().toExternalForm();
                res.quoteUrl = baseUrl + '/' + quote.Id;
                res.quoteId = quote.Id;
                res.quoteTotal = total;
                res.outputSuccess = true;

            } catch (Exception e) {
                res.outputSuccess = false;
                res.outputError = e.getMessage();
            }

            responses.add(res);
        }

        return responses;
    }
}
