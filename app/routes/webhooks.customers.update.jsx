import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import axios from "axios";


export const action = async ({ request }) => {

    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);
    const emailstatus = payload.email_marketing_consent ? payload.email_marketing_consent.state : payload.email_marketing_consent;
    const phonestatus = payload.sms_marketing_consent ? payload.sms_marketing_consent.state : payload.sms_marketing_consent;
    let datastatus;
    let data;

    if (emailstatus == "subscribed" && phonestatus == "subscribed") {
        datastatus = {
            cellphoneAndEmailList: [
                payload.email ? payload.email : '',
                payload.phone ? payload.phone : ''
            ],
            emailOrCellphone: "Any",
            newStatus: "Active"
        };
        console.log('subs')
    }

    if (emailstatus == "subscribed" && phonestatus != "subscribed") {
        datastatus = {
            cellphoneAndEmailList: [
                payload.email ? payload.email : '',
                payload.phone ? payload.phone : ''
            ],
            emailOrCellphone: "Email",
            newStatus: "Active"
        };
    }
    if (emailstatus != "subscribed" && phonestatus == "subscribed") {
        datastatus = {
            cellphoneAndEmailList: [
                payload.email ? payload.email : '',
                payload.phone ? payload.phone : ''
            ],
            emailOrCellphone: "Sms",
            newStatus: "Active"
        };
    }

    if (emailstatus == "unsubscribed" && phonestatus == "unsubscribed") {
        datastatus = {
            cellphoneAndEmailList: [
                payload.email ? payload.email : '',
                payload.phone ? payload.phone : ''
            ],
            emailOrCellphone: "Any",
            newStatus: "Removed"
        };
    }

    if (emailstatus == "unsubscribed" && phonestatus != "unsubscribed") {
        datastatus = {
            cellphoneAndEmailList: [
                payload.email ? payload.email : '',
                payload.phone ? payload.phone : ''
            ],
            emailOrCellphone: "Email",
            newStatus: "Removed"
        };
    }

    if (emailstatus != "unsubscribed" && phonestatus == "unsubscribed") {
        datastatus = {
            cellphoneAndEmailList: [
                payload.email ? payload.email : '',
                payload.phone ? payload.phone : ''
            ],
            emailOrCellphone: "Sms",
            newStatus: "Removed"
        };
    }

    try {
        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: shop,
            },
        })
        const groupArray = shopInfo.signupGroup.split(',').map(group => parseInt(group, 10));

        if (emailstatus == null && phonestatus == null) {
            data = {
                clientsData: [
                    {
                        cellphone: payload.phone,
                        email: payload.email,
                        firstName: payload.first_name,
                        lastName: payload.last_name,
                        address: payload.default_address.city + ',' + payload.default_address.province_code + ',' + payload.default_address.country_name,
                        city: payload.default_address.city,
                        state: payload.default_address.province,
                        country: payload.default_address.country_name,
                        zip: payload.default_address.province_code,
                        needOptin: true,
                        overwrite: true,
                        optinType: "EmailAndSms",
                        overwriteOption: "OverwriteWithNotEmptyValuesOnly"
                    }
                ],
                groupIds: groupArray
            }

            const config2 = {
                method: 'post',
                url: 'https://demo-server/api/v1/ClientsApi/AddClients',
                headers: {
                    'APIKey': shopInfo.apiKey,
                },
                data,
            };

            const reponse2 = await axios(config2);
            if(reponse2){
                return ('customer updated')
            }else{
                return ('error while updating customer')
            }
            

        }

        if (emailstatus == "not_subscribed" && phonestatus == null || emailstatus == null && phonestatus == "not_subscribed" || emailstatus == "not_subscribed" && phonestatus == "not_subscribed") {
            data = {
                clientsData: [
                    {
                        cellphone: payload.phone,
                        email: payload.email,
                        firstName: payload.first_name,
                        lastName: payload.last_name,
                        address: payload.default_address.city + ',' + payload.default_address.province_code + ',' + payload.default_address.country_name,
                        city: payload.default_address.city,
                        state: payload.default_address.province,
                        country: payload.default_address.country_name,
                        zip: payload.default_address.province_code,
                        needOptin: true,
                        overwrite: true,
                        optinType: "EmailAndSms",
                        overwriteOption: "OverwriteWithNotEmptyValuesOnly"
                    }
                ],
                groupIds: groupArray
            };

            const config3 = {
                method: 'post',
                url: 'https://demo-server/api/v1/ClientsApi/AddClients',
                headers: {
                    'APIKey': shopInfo.apiKey,
                },
                data,
            };

            const reponse2 = await axios(config3);

            if(reponse2){
                return ('customer updated')
            }else{
                return ('error while updating customer')
            }

        }

        if (shopInfo.newSignup == 1) {
            const config = {
                method: 'post',
                url: 'https://demo-server/api/v1/ClientsApi/AddClients',
                headers: {
                    'APIKey': shopInfo.apiKey,
                },
                data: datastatus,
            };

            const response = await axios(config);
            if (response) {
                console.log('success----')
            } else {
                console.log('error----')
            }
        }
    } catch (error) {
        console.log('error----', error)
        return ('Error:', error);
    }

    return new Response();
};
