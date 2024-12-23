import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import axios from "axios";

export const action = async ({ request }) => {
    const { shop, payload, topic } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    //console.log(JSON.stringify(payload, null, 2));
    try {
        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: shop,
            },
        });

        const ShopCustomers = await prisma.shopCustomers.findFirst({
            where: {
                shop: shop,
                customerId:String(payload.id)
            },
        });
        const datastatus = {
            cellphoneAndEmailList: [
                ShopCustomers.customerEmail?ShopCustomers.customerEmail:'',
                ShopCustomers.customerPhone?ShopCustomers.customerPhone:''
            ],
            emailOrCellphone: "Any",
            newStatus: "Invalid"
        };

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
            await prisma.shopCustomers.deleteMany({
                where: {
                    shop: {
                        contains: shop,
                    },
                    customerId:{
                        contains: ShopCustomers.customerId,
                    }
                },
            })

            return ('Customer removed')
            console.log(response);
        } else {
            return ('error Customer removing')
            console.log('error Customer removing----');
    
        }

    } catch (error) {
        return (error)
    }
    return new Response();
};
