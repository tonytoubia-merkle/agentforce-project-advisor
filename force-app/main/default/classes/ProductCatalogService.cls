/**
 * ProductCatalogService - Invocable Apex action for Agentforce
 * Searches the product catalog and returns results as JSON
 */
public with sharing class ProductCatalogService {

    public class SearchRequest {
        @InvocableVariable(label='category' description='Product category filter')
        public String category;

        @InvocableVariable(label='projectType' description='Project type filter (diy, renovation, new-build, repair, professional)')
        public String projectType;

        @InvocableVariable(label='maxResults' description='Maximum results to return')
        public Integer maxResults;

        @InvocableVariable(label='query' description='Search keyword')
        public String query;

        @InvocableVariable(label='skillLevel' description='Customer skill level (beginner, intermediate, advanced, professional)')
        public String skillLevel;
    }

    public class SearchResponse {
        @InvocableVariable(label='output' description='JSON string of matching products')
        public String output;
    }

    @InvocableMethod(
        label='Search Product Catalog'
        description='Search the product catalog for home improvement products'
        category='Agentforce'
    )
    public static List<SearchResponse> searchProducts(List<SearchRequest> requests) {
        List<SearchResponse> responses = new List<SearchResponse>();

        for (SearchRequest req : requests) {
            SearchResponse res = new SearchResponse();

            try {
                // Build dynamic SOQL query
                String soql = 'SELECT Id, Name, Brand__c, Category__c, Price__c, Description__c, ' +
                              'ImageUrl__c, ProjectTypes__c, Rating__c, IsPro__c, IsBulk__c, InStock__c ' +
                              'FROM Product2 WHERE IsActive = true';

                List<String> conditions = new List<String>();

                if (String.isNotBlank(req.category)) {
                    conditions.add('Category__c = :category');
                }

                if (String.isNotBlank(req.projectType)) {
                    conditions.add('ProjectTypes__c LIKE :projectTypePattern');
                }

                if (String.isNotBlank(req.query)) {
                    conditions.add('(Name LIKE :queryPattern OR Description__c LIKE :queryPattern)');
                }

                if (String.isNotBlank(req.skillLevel)) {
                    conditions.add('SkillLevel__c = :skillLevel');
                }

                if (!conditions.isEmpty()) {
                    soql += ' AND ' + String.join(conditions, ' AND ');
                }

                Integer limitVal = (req.maxResults != null && req.maxResults > 0) ? req.maxResults : 10;
                soql += ' LIMIT ' + limitVal;

                // Bind variables
                String category = req.category;
                String projectTypePattern = '%' + (req.projectType != null ? req.projectType : '') + '%';
                String queryPattern = '%' + (req.query != null ? req.query : '') + '%';
                String skillLevel = req.skillLevel;

                // Execute query
                List<Product2> products = Database.query(soql);

                // Transform to JSON response
                List<Map<String, Object>> productList = new List<Map<String, Object>>();
                for (Product2 p : products) {
                    Map<String, Object> productMap = new Map<String, Object>();
                    productMap.put('productId', p.Id);
                    productMap.put('name', p.Name);
                    productMap.put('brand', p.Brand__c);
                    productMap.put('category', p.Category__c);
                    productMap.put('price', p.Price__c);
                    productMap.put('description', p.Description__c);
                    productMap.put('imageUrl', p.ImageUrl__c);
                    productMap.put('projectTypes', p.ProjectTypes__c);
                    productMap.put('rating', p.Rating__c);
                    productMap.put('isPro', p.IsPro__c);
                    productMap.put('isBulk', p.IsBulk__c);
                    productMap.put('inStock', p.InStock__c);
                    productList.add(productMap);
                }

                res.output = JSON.serialize(productList);

            } catch (Exception e) {
                // Return empty array on error with error info
                Map<String, Object> errorResponse = new Map<String, Object>();
                errorResponse.put('error', e.getMessage());
                errorResponse.put('products', new List<Object>());
                res.output = JSON.serialize(errorResponse);
            }

            responses.add(res);
        }

        return responses;
    }
}
