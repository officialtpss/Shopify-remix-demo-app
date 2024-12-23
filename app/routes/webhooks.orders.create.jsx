import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import axios from "axios";

export const action = async ({ request }) => {
    const { shop, payload, topic, session } = await authenticate.webhook(request);

    let token;
    if (session) {
        token = await prisma.session.findFirst({ where: { shop } });
    }

    let datastatus;
    let data;
    const emailstatus = payload.customer.email_marketing_consent ? payload.customer.email_marketing_consent.state : payload.customer.email_marketing_consent;
    const phonestatus = payload.customer.sms_marketing_consent ? payload.customer.sms_marketing_consent.state : payload.customer.sms_marketing_consent;
    const productItems = [];
    let groups;
    try {
        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: shop,
            },
        })

        const deleteUsers = await prisma.abandonmentCart.deleteMany({
            where: {
                checkoutId: {
                    contains: String(payload.checkout_id),
                },
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

        if (shopInfo.purchase == 1 && payload.line_items) {
            for (const item of payload.line_items) {
                try {
                    const query = `
                        query GetProduct($id: ID!) {
                            product(id: $id) {
                            id
                            handle
                            title
                            collections(first: 10) {
                                nodes {
                                id
                                title
                                }
                            }
                            featuredMedia{
                                preview{
                                    image{
                                    url
                                    }
                                }
                            }
                            }
                        }
                        `;

                    const variables = {
                        "id": "gid://shopify/Product/" + item.product_id
                    };

                    const response = await axios.post(
                        `https://${shop}/admin/api/2024-10/graphql.json`,
                        { query, variables },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Shopify-Access-Token': token.accessToken,
                            },
                        }
                    );

                    const productitem = response.data.data.product;
                    productItems.push({
                        productID: item.variant_id,
                        productCategoryName: productitem.collections?.nodes
                            ?.map((collection) => collection.title)
                            .join(",") || "",
                        imageURL: productitem.featuredMedia?.preview?.image.url,
                        name: item.name,
                        description: "Hiking Shoes",
                        quantity: item.quantity,
                        price: item.price,
                        hrefUrl: "https://" + shop + "/products/" + productitem.handle
                    });
                } catch (error) {
                    console.error(`Error fetching variant data for item ${item.variant_id}:`, error);
                }
            }

            data = {
                clientData: {
                    cellphone: payload.customer.phone,
                    email: payload.customer.email,
                    firstName: payload.customer.first_name,
                    lastName: payload.customer.last_name,
                    address: payload.customer.default_address.country,
                    city: payload.customer.default_address.city,
                    state: payload.customer.default_address.province,
                    country: payload.customer.default_address.country_name,
                    zip: payload.customer.default_address.province_code,
                },
                groupIds: groups,
                products: productItems,
                eventType: "Purchase",
                eventSource: "shopify"
            };
        }

        if (emailstatus == "subscribed" && phonestatus == "subscribed") {
            datastatus = {
                cellphoneAndEmailList: [
                    payload.customer.email,
                    payload.customer.phone ? payload.customer.phone : ''
                ],
                emailOrCellphone: "Any",
                newStatus: "Active"
            };
        }

        if (emailstatus == "subscribed" && phonestatus != "subscribed") {
            datastatus = {
                cellphoneAndEmailList: [
                    payload.customer.email,
                    payload.customer.phone ? payload.customer.phone : ''
                ],
                emailOrCellphone: "Email",
                newStatus: "Active"
            };
        }
        if (emailstatus != "subscribed" && phonestatus == "subscribed") {
            datastatus = {
                cellphoneAndEmailList: [
                    payload.customer.email,
                    payload.customer.phone ? payload.customer.phone : ''
                ],
                emailOrCellphone: "Sms",
                newStatus: "Active"
            };
        }


        if (emailstatus == null && phonestatus == null) {
            data = {
                clientData: {
                    cellphone: payload.customer.phone,
                    email: payload.customer.email,
                    firstName: payload.customer.first_name,
                    lastName: payload.customer.last_name,
                    address: payload.customer.default_address.country,
                    city: payload.customer.default_address.city,
                    state: payload.customer.default_address.province,
                    country: payload.customer.default_address.country_name,
                    zip: payload.customer.default_address.province_code,
                    needOptin: true,
                    overwrite: true,
                    optinType: "EmailAndSms",
                    overwriteOption: "OverwriteWithNotEmptyValuesOnly"
                },
                groupIds: groups,
                products: productItems,
                eventType: "Purchase",
                eventSource: "shopify"
            };
        }

        if (emailstatus != null && phonestatus == null) {
            data = {
                clientData: {
                    cellphone: payload.customer.phone,
                    email: payload.customer.email,
                    firstName: payload.customer.first_name,
                    lastName: payload.customer.last_name,
                    address: payload.customer.default_address.country,
                    city: payload.customer.default_address.city,
                    state: payload.customer.default_address.province,
                    country: payload.customer.default_address.country_name,
                    zip: payload.customer.default_address.province_code,
                    needOptin: false,
                    overwrite: true,
                    optinType: "EmailOnly",
                    overwriteOption: "OverwriteWithNotEmptyValuesOnly"
                },
                groupIds: groups,
                products: productItems,
                eventType: "Purchase",
                eventSource: "shopify"
            };
        }

        if (emailstatus == null && phonestatus != null) {
            data = {
                clientData: {
                    cellphone: payload.customer.phone,
                    email: payload.customer.email,
                    firstName: payload.customer.first_name,
                    lastName: payload.customer.last_name,
                    address: payload.customer.default_address.country,
                    city: payload.customer.default_address.city,
                    state: payload.customer.default_address.province,
                    country: payload.customer.default_address.country_name,
                    zip: payload.customer.default_address.province_code,
                    needOptin: false,
                    overwrite: true,
                    optinType: "SmsOnly",
                    overwriteOption: "OverwriteWithNotEmptyValuesOnly"
                },
                groupIds: groups,
                products: productItems,
                eventType: "Purchase",
                eventSource: "shopify"
            };
        }

        if (shopInfo.purchase == 1) {
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
        }
    } catch (error) {
        return ('Error:', error);
    }
    return new Response();
};
