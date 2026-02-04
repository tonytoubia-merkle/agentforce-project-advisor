/**
 * AgentTransferService - Invocable Apex action for Agentforce
 * Transfers conversation to a live human agent
 */
public with sharing class AgentTransferService {

    public class TransferRequest {
        @InvocableVariable(label='reason' description='Reason for the transfer' required=true)
        public String reason;

        @InvocableVariable(label='priority' description='Transfer priority: normal, high, urgent')
        public String priority;

        @InvocableVariable(label='sessionId' description='Messaging session ID')
        public String sessionId;

        @InvocableVariable(label='contactId' description='Contact ID for the customer')
        public String contactId;
    }

    public class TransferResponse {
        @InvocableVariable(label='transferSuccess' description='True if transfer was successful')
        public Boolean transferSuccess;

        @InvocableVariable(label='transferId' description='Transfer record ID')
        public String transferId;

        @InvocableVariable(label='outputError' description='Error message if transfer failed')
        public String outputError;

        @InvocableVariable(label='estimatedWaitTime' description='Estimated wait time in minutes')
        public Integer estimatedWaitTime;
    }

    @InvocableMethod(
        label='Transfer to Agent'
        description='Transfers the conversation to a live human agent'
        category='Agentforce'
    )
    public static List<TransferResponse> transferToAgent(List<TransferRequest> requests) {
        List<TransferResponse> responses = new List<TransferResponse>();

        for (TransferRequest req : requests) {
            TransferResponse res = new TransferResponse();

            try {
                // In production, this would integrate with Omni-Channel routing
                // For now, we create a Case to track the escalation

                Case escalationCase = new Case();
                escalationCase.Subject = 'Agent Transfer Request: ' + req.reason;
                escalationCase.Description = 'Transfer Reason: ' + req.reason + '\n' +
                                            'Priority: ' + (String.isNotBlank(req.priority) ? req.priority : 'normal') + '\n' +
                                            'Session ID: ' + req.sessionId;
                escalationCase.Status = 'New';
                escalationCase.Origin = 'Chat';

                // Set priority based on request
                if (req.priority == 'urgent') {
                    escalationCase.Priority = 'High';
                } else if (req.priority == 'high') {
                    escalationCase.Priority = 'Medium';
                } else {
                    escalationCase.Priority = 'Low';
                }

                // Link to Contact if available
                if (String.isNotBlank(req.contactId)) {
                    escalationCase.ContactId = req.contactId;
                }

                insert escalationCase;

                res.transferSuccess = true;
                res.transferId = escalationCase.Id;
                res.estimatedWaitTime = req.priority == 'urgent' ? 2 : (req.priority == 'high' ? 5 : 10);

            } catch (Exception e) {
                res.transferSuccess = false;
                res.outputError = e.getMessage();
            }

            responses.add(res);
        }

        return responses;
    }
}
