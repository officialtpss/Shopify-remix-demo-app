import prisma from "../db.server"; 
import axios from "axios";

export const action = async ({ request }) => {
    const formData = await request.formData();
    const shop = formData.get("shop");
    const type = formData.get("type");
    const newSignup = formData.get("newSignup");
    const cartAbandonment = formData.get("cartAbandonment");
    const purchase = formData.get("purchase");
    const signupGroup = formData.get("signupGroup");
    const cartGroup = formData.get("cartGroup");
    const purchaseGroup = formData.get("purchaseGroup");
    const webpixel = formData.get("webpixel");

   
    if(type == 'getgroups'){
        try {
            const shopInfo = await prisma.shopInfo.findFirst({
                where: {
                    shop: shop,
                },
            })
            const data = {
                groupName: "",
                groupType: "All",
            };
            const config = {
                method: 'post',
                url: 'https://demo-server/api/v1/ClientsApi/AddClients',
                headers: {
                    'APIKey': shopInfo.apiKey,
                },
                data,
            };
            const response = await axios(config);
            if (response.data) {
                return ({groups: response.data.groups,shopinfo:shopInfo});
            }else {
                return ({ error: "Invalid API Key" });
            }
        } catch (error) {
            return('Error:', error);
        }
    }
    else if(type == 'savegroups'){
        try {
            const data = {
                newSignup: parseInt(newSignup, 10),
                cartAbandonment: parseInt(cartAbandonment, 10),
                purchase: parseInt(purchase, 10),
                signupGroup: signupGroup,
                cartGroup: cartGroup,
                purchaseGroup: purchaseGroup
            };

            const updateUser = await prisma.shopInfo.updateMany({
                where: {
                    shop: shop,
                },
                data: data,
            });
           
            if (updateUser) {
                return (updateUser);
            } else {
                return ({ error: "Invalid API Key" });
            }
        } catch (error) {
            return('Error:', error);
        }
      
    }
    else if(type == 'savetracking'){
        let data;
        try {
            const user = await prisma.session.findFirst({
                where: {
                    shop: shop,
                },
            });

            if(webpixel == true || webpixel == 'true'){

                const response = await fetch(`https://${user.shop}/admin/api/2024-10/graphql.json`, {
                    method: 'POST',
                    headers: {
                        'X-Shopify-Access-Token': user.accessToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                        mutation {
                            webPixelCreate(webPixel: { settings: "{\\"accountID\\":\\"123\\"}" }) {
                            userErrors {
                                code
                                field
                                message
                            }
                            webPixel {
                                settings
                                id
                            }
                            }
                        }
                        `,
                    }),
                });

                const result = await response.json();
                data = {
                    webpixel:parseInt(1),
                    webpixel_id:result.data.webPixelCreate.webPixel.id
                };
                
                await prisma.shopInfo.updateMany({
                    where: {
                        shop: shop,
                    },
                    data: data,
                });
                return ("success");
            }else{
                const userInfo = await prisma.shopInfo.findFirst({
                    where: {
                        shop: shop,
                    },
                });

                const response = await fetch(`https://${user.shop}/admin/api/2024-10/graphql.json`, {
                    method: 'POST',
                    headers: {
                        'X-Shopify-Access-Token': user.accessToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                        mutation {
                            webPixelDelete(id:"`+userInfo.webpixel_id+`") {
                                userErrors {
                                    code
                                    field
                                    message
                                }
                            }
                        }
                        `,
                    }),
                });

                data = {
                    webpixel:parseInt(0),
                    webpixel_id:""
                };
                const updateUser = await prisma.shopInfo.updateMany({
                    where: {
                        shop: shop,
                    },
                    data: data,
                });

                return ("success");
            }
        } catch (error) {
            return('Error:', error);
        }
      
    }
};
