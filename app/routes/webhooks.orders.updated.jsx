import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import axios from "axios";

export const action = async ({ request }) => {
    const { shop, payload, topic } = await authenticate.webhook(request);
    //console.log(JSON.stringify(payload, null, 2));


    let datastatus;
    const status = payload.customer.email_marketing_consent?.state;
    let groups;
    try {

        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: shop,
            },
        })

        const groupArray = shopInfo.signupGroup.split(',').map(group => parseInt(group, 10));
        const groupArray2 = shopInfo.purchaseGroup.split(',').map(group => parseInt(group, 10));
        if (shopInfo.newSignup == 1 && shopInfo.purchase == 1) {
            groups = [...groupArray, ...groupArray2];

        }
        if (shopInfo.newSignup == 0 && shopInfo.purchase == 1) {
            groups = [...groupArray2];
        }

        const data = {
            clientsData: [
                {
                    cellphone: payload.customer.phone,
                    email: payload.customer.email,
                    firstName: payload.customer.first_name,
                    lastName: payload.customer.last_name,
                    address: payload.customer.default_address.country,
                    city: payload.customer.default_address.city,
                    state: payload.customer.default_address.province,
                    country: payload.customer.default_address.country_name,
                    zip: payload.customer.default_address.province_code,
                }
            ],
            groupIds: groups
        };

        if (status == "subscribed") {
            datastatus = {
                cellphoneAndEmailList: [
                    payload.customer.email,
                    payload.customer.phone ? payload.customer.phone : ''
                ],
                emailOrCellphone: "Any",
                newStatus: "Active"
            };
        } else {
            datastatus = {
                cellphoneAndEmailList: [
                    payload.customer.email,
                    payload.customer.phone ? payload.customer.phone : ''
                ],
                emailOrCellphone: "Any",
                newStatus: "Removed"
            };
        }
        const config = {
            method: 'post',
            url: 'https://demo-server/api/v1/ClientsApi/AddClients',
            headers: {
                'APIKey': shopInfo.apiKey,
            },
            data,
        };


        const config2 = {
            method: 'post',
            url: 'https://demo-server/api/v1/ClientsApi/AddClients',
            headers: {
                'APIKey': shopInfo.apiKey,
            },
            data: datastatus,
        };

        const response = await axios(config);
        const response2 = await axios(config2);

        if (response2) {
            console.log('success----')
        } else {
            console.log('error----')
        }
    } catch (error) {
        return ('Error:', error);
    }
    return new Response();
};
