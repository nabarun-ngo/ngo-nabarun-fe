export const SCOPE = {
    read: {
        users:'read:users',
        user:'read:user',
        work:'read:work',
        request:'read:request',
        notices:'read:notices',
        notice:'read:notice',
        donations:'read:donations',
        user_donations:'read:user_donations',
        accounts:'read:accounts',
        transactions:'read:transactions',
        donation_guest:'read:donation_guest',
        expenses:'read:expenses',
        admin_service:'read:admin_service',
        actuator:'read:actuator',

        // profile: 'read:profile',
        // funds:'read:funds',  
        // expenditure:'read:expenditure',
        // //my_contribution: 'read:self_donation',
        // contribution: 'read:all_donation',
        // donation_attachment: 'read:donation_attachment',
        // all_profiles: 'read:volunteer_summary',
        // other_profile_info:'read:volunteer',
        // events:'read:event',
        // self_request:'read:self_request',
        // join_request: 'read:join_request',
        // quit_request:'read:quit_request',
        // intermission_request:'read:intermission_request',
        // other_request:'read:other_request',
        // notice:'read:notice',
        // contact_request:'read:contact_request',
        // actuators: 'read:actuators',   
        // trash:'read:trash',
        // fund_history:'read:funds_changes',
        // expense_history:'read:expenditure_changes',
        // donation_history:'read:donation_changes',
        // event_history:'read:event_changes',
        // request_history:'read:request_changes',
        // notice_history:'read:notice_changes',
        // config:'read:config',
        // payment_details:'read:payment_details'
    },
    create: {
        request:'create:request',
        notice:'create:notice',
        donation:'create:donation',
        account:'create:account',
        transaction:'create:transaction',
        expense:'create:expense', 
        expense_item:'create:expense_item',
        apikey:'create:apikey', 
        servicerun:'create:servicerun',

        // funds:'create:funds',
        // expenditure:'create:expenditure',
        // contribution: 'create:donation',
        // donation_attachment: 'create:donation_attachment',
        // events:'create:event',
        // request:'create:request',
        // notice:'create:notice',
    },
    update: {
        user:'update:user',
        work:'update:work',
        request:'update:request',
        notice:'update:notice',
        donation:'update:donation',
        account:'update:account',
        expense:'update:expense',
        apikey:'update:apikey',
        actuator:'update:actuator',

        // profile: 'update:profile',
        // update_password:'update:self_password',
        // update_email:'update:self_email',
        // funds:'update:funds',
        // expenditure:'update:expenditure',
        // contribution: 'update:donation',
        // other_profile_info:'update:volunteer',
        // events:'update:event',
        // join_request_G1: 'update:join_request_GR1',
        // join_request_G2: 'update:join_request_GR2',
        // join_request_G3: 'update:join_request_GR3',
        // quit_request_G1: 'update:quit_request_GR1',
        // quit_request_G2: 'update:quit_request_GR2',
        // quit_request_G3: 'update:quit_request_GR3',
        // intermission_request:'update:other_request',
        // other_request:'update:intermission_request',
        // notice:'update:notice',
        // contact_request:'update:contact_request',
        // volunteer_admin_attributes:'update:volunteer_admin_attributes',
        // volunteer_donation_attributes:'update:volunteer_donation_attributes',
        // config:'update:config',
        // payment_details:'update:payment_details'
    },
    delete:{
        notice:'delete:notice',
        // funds:'delete:funds',
        // expenditure:'delete:expenditure',
        // donation:'delete:donation',
        // donation_attachment: 'delete:donation_attachment',
        // //user_profile: 'delete:volunteer',
        // events:'delete:event',
        // notice:'delete:notice',
        // trash:'delete:trash',
    },
    restore:{
        //trash:'restore:trash',
    }
};

export function getScopes(){
    var scope='';

    Object.values(SCOPE).forEach(level1 => {
        Object.values(level1).forEach(level2=>{
            scope=scope+' '+level2;
        })
    })
    //console.log('Additional scope : '+scope)
    return scope;
}

