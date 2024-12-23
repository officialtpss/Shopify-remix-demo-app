import prisma from "../db.server"; 
import axios from "axios";

export const action = async ({ request }) => {
    const formData = await request.json();

    try {
        
        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: formData.shop,
            },
        })
        const data = {
            clientData: {
                email: formData.email,
                cellphone: formData.phone,
                externalCustomerID: formData.customer_id
            },
            pageView: {
                url: formData.url,
                timestamp: formData.timestamp
            },
            arrivalSource: "Shopify"
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
        if (response) {
            return ("success")
            //return response.data;
        }else {
            return ("Error");
        }
        
    }catch (error) {
        console.error("Error :", error);
        return new Response("Failed to fetch data", { status: 500 });
    }
   
}