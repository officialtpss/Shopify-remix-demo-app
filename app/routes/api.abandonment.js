import prisma from "../db.server";
import axios from "axios";

export const loader = async () => {
    const result = [];
    let groups;
    const productItems = [];
    try {
        const users = await prisma.session.findMany();
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

        for (const user of users) {
            const shopInfo = await prisma.shopInfo.findFirst({
                where: {
                    shop: user.shop,
                },
            })
            if (shopInfo) {
                if (shopInfo.cartAbandonment == 1) {

                    const groupArray = shopInfo.signupGroup.split(',').map(group => parseInt(group, 10));
                    const groupArray2 = shopInfo.purchaseGroup.split(',').map(group => parseInt(group, 10));
                    const groupArray3 = shopInfo.cartGroup.split(',').map(group => parseInt(group, 10));
                    if (shopInfo.newSignup == 1 && shopInfo.purchase == 1 && shopInfo.cartAbandonment == 1) {
                        groups = [...groupArray, ...groupArray2, ...groupArray3];
                    }
                    if (shopInfo.newSignup == 1 && shopInfo.cartAbandonment == 1 && shopInfo.purchaseGroup == 0) {
                        groups = [...groupArray, ...groupArray3];
                    }
                    if (shopInfo.purchaseGroup == 1 && shopInfo.cartAbandonment == 1 && shopInfo.newSignup == 0) {
                        groups = [...groupArray2, ...groupArray3];
                    }
                    const response = await fetch('https://' + user.shop + '/admin/api/2024-10/graphql.json', {
                        method: 'POST',
                        headers: {
                            'X-Shopify-Access-Token': user.accessToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `
                                query AbandonedCheckouts {
                                    abandonedCheckouts(first:10,query: "created_at:>${yesterday}") {
                                    nodes {
                                        name
                                        completedAt
                                        customer {
                                        firstName
                                        lastName
                                        email
                                        phone
                                        }
                                        lineItems(first:10) {
                                        nodes {
                                            originalTotalPriceSet{
                                            shopMoney{
                                                amount
                                            }
                                            }
                                            variant{
                                            id
                                            product{
                                                handle
                                            }
                                            }
                                            quantity
                                            title
                                            image{
                                            url
                                            }
                                        }
                                        }
                                    }
                                    }
                                }
                                `
                        })
                    });

                    if (!response.ok) return new Response(`Error: ${response.statusText}`);

                    const { data } = await response.json();

                    const abandonedCheckouts = data?.abandonedCheckouts?.nodes || [];
                    for (const checkout of abandonedCheckouts) {
                        const str = checkout.name;
                        const checkoutId = str.replace("#", "");
                        //if(shopInfo.tracking == 'immediately' || shopInfo.tracking == 'interval' &&  shopInfo.abandonmentNumber <= 30){

                        const cartRecord = await prisma.abandonmentCart.findFirst({
                            where: {
                                checkoutId: checkoutId,
                            },
                        });
                        if (cartRecord) {
                            for (const item of checkout.lineItems?.nodes || []) {
                                productItems.push({
                                    productID: item.variant.id,
                                    imageURL: item.image.url,
                                    name: item.title,
                                    quantity: item.quantity,
                                    price: item.originalTotalPriceSet.shopMoney.amount,
                                    hrefUrl: "https://" + user.shop + "/products/" + item.variant.product.handle
                                });
                            }

                            const config = {
                                method: 'post',
                                url: 'https://demo-server/api/v1/ClientsApi/AddClients',
                                headers: {
                                    'APIKey': shopInfo.apiKey,
                                },
                                data: {
                                    clientData: {
                                        cellphone: checkout.customer.phone,
                                        email: checkout.customer.email,
                                    },
                                    groupIds: groups,
                                    products: productItems,
                                    eventType: "Abandonment",
                                    eventSource: "shopify"
                                },
                            };
                            const response = await axios(config);
                            if (response) {
                                await prisma.abandonmentCart.deleteMany({
                                    where: {
                                        checkoutId: {
                                            contains: checkoutId,
                                        },
                                    },
                                })
                            } else {
                                console.log("error in cron")
                            }
                        }
                        
                    }
                }
            }
        }
        return result;
    } catch (error) {
        console.error("Error fetching abandoned checkouts:", error);
        return new Response("Failed to fetch data", { status: 500 });
    }
};
