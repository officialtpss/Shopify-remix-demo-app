import prisma from "../db.server";
import axios from "axios";

export const action = async ({ request }) => {
    const formData = await request.formData();
    const apiKey = formData.get("key");
    const shop = formData.get("domain");

    if (!apiKey) {
        return ({ error: "API Key are required" }, { status: 400 });
    }

    try {
        const config = {
            method: 'get',
            url: 'https://demo-server/api/v1/ClientsApi/AddClients',
            headers: {
                'APIKey': apiKey,
            },
        };

        const response = await axios(config);

        if (response.data.accountName) {
            const upsertUser = await prisma.shopInfo.create({
                data: {
                    shop: shop,
                    customerId: apiKey,
                },
            });
            console.log("New ShopInfo:", upsertUser);

            return ({ message: "API Key verified and saved" });
        } else {
            return ({ error: "Invalid API Key value" });
        }
    } catch (error) {
        return ({ error: "Invalid API Key" });
    } finally {
        await prisma.$disconnect();
    }
};
