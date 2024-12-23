import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import axios from "axios";

export const action = async ({ request }) => {
    const { shop, payload, topic } = await authenticate.webhook(request);
    // console.log(JSON.stringify(payload, null, 2));
    const emailstatus = payload.email_marketing_consent?.state;
    const phonestatus = payload.sms_marketing_consent?.state;
    let data;
    try {
        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: shop,
            },
        })

        const ShopCustomers = await prisma.shopCustomers.create({
            data: {
                shop: shop,
                customerId:payload.id,
                customerEmail:payload.email,
                customerPhone:payload.default_address?.phone
            },
        });

        const groupArray = shopInfo.signupGroup.split(',').map(group => parseInt(group, 10));
        if (emailstatus == "subscribed" && phonestatus == "subscribed") {
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
                    }
                ],
                groupIds: groupArray
            };
        }

        if (emailstatus == "subscribed" && phonestatus != "subscribed") {
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
                        needOptin: false,
                        overwrite: true,
                        optinType: "EmailOnly",
                        overwriteOption: "OverwriteWithNotEmptyValuesOnly"
                    }
                ],
                groupIds: groupArray
            };
        }

        if (emailstatus != "subscribed" && phonestatus == "subscribed") {
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
                        optinType: "SmsOnly",
                        overwriteOption: "OverwriteWithNotEmptyValuesOnly"
                    }
                ],
                groupIds: groupArray
            };
        }

        if (emailstatus != "subscribed" && phonestatus != "subscribed") {
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
        }

        if (shopInfo.newSignup == 1) {

            const config = {
                method: 'post',
                url: 'https://demo-server/api/v1/ClientsApi/AddClients',
                headers: {
                    'APIKey': shopInfo.apiKey,
                },
                data,
            };

            const response = await axios(config);

            if (response) {
                console.log('client added successfully----')
            } else {
                console.log('error client adding----')
            }
        }
    } catch (error) {
        return ('Error:', error);
    }

    return new Response();
};
