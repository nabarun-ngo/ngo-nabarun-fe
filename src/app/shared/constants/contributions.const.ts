export const DONATION_CONST = {
   status:{
       raised: 'RAISED',
       paid: 'PAID',
       pending:'PENDING',
       uncleared:'PAYMENT_FAILED',
       deferred:'PAY_LATER',
       cancelled:'CANCELLED'
   },
   type:{
       regular:'REGULAR',
       onceoff:'ONETIME',
   },
   paymentMethod:{
    cash:'CASH',
    upi:'UPI',
    netbanking:'NETBANKING'
   }
};