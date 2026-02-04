/**
 * CheckoutService - Invocable Apex action for Agentforce
 * Initiates checkout process for selected products
 */
public with sharing class CheckoutService {

    public class CheckoutRequest {
        @InvocableVariable(label='products' description='JSON array of products to checkout' required=true)
        public String products;

        @InvocableVariable(label='checkoutType' description='Type of checkout: standard, quote, bulk')
        public String checkoutType;

        @InvocableVariable(label='contactId' description='Contact ID for the customer')
        public String contactId;
    }

    public class CheckoutResponse {
        @InvocableVariable(label='checkoutUrl' description='URL to complete checkout')
        public String checkoutUrl;

        @InvocableVariable(label='orderId' description='Generated order ID')
        public String orderId;

        @InvocableVariable(label='outputSuccess' description='True if checkout initiated successfully')
        public Boolean outputSuccess;

        @InvocableVariable(label='outputError' description='Error message if checkout failed')
        public String outputError;
    }

    @InvocableMethod(
        label='Initiate Checkout'
        description='Initiates the checkout process for selected products'
        category='Agentforce'
    )
    public static List<CheckoutResponse> initiateCheckout(List<CheckoutRequest> requests) {
        List<CheckoutResponse> responses = new List<CheckoutResponse>();

        for (CheckoutRequest req : requests) {
            CheckoutResponse res = new CheckoutResponse();

            try {
                // Parse products JSON
                List<Object> productList = (List<Object>) JSON.deserializeUntyped(req.products);

                if (productList.isEmpty()) {
                    res.outputSuccess = false;
                    res.outputError = 'No products provided for checkout';
                    responses.add(res);
                    continue;
                }

                // Create Order record
                Order newOrder = new Order();
                newOrder.Status = 'Draft';
                newOrder.EffectiveDate = Date.today();

                // Set Account from Contact if available
                if (String.isNotBlank(req.contactId)) {
                    List<Contact> contacts = [SELECT AccountId FROM Contact WHERE Id = :req.contactId LIMIT 1];
                    if (!contacts.isEmpty() && contacts[0].AccountId != null) {
                        newOrder.AccountId = contacts[0].AccountId;
                    }
                }

                // For demo: use a default account if none found
                if (newOrder.AccountId == null) {
                    List<Account> defaultAccounts = [SELECT Id FROM Account WHERE Name = 'Guest Customer' LIMIT 1];
                    if (!defaultAccounts.isEmpty()) {
                        newOrder.AccountId = defaultAccounts[0].Id;
                    }
                }

                insert newOrder;

                // Generate checkout URL (would integrate with Commerce Cloud in production)
                String baseUrl = URL.getOrgDomainUrl().toExternalForm();
                res.checkoutUrl = baseUrl + '/checkout/' + newOrder.Id;
                res.orderId = newOrder.Id;
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
