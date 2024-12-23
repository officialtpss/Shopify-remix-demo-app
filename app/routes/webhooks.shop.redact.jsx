import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
    const { shop, payload, topic } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    try {
        const shop = payload.shop_domain;
        await db.session.deleteMany({ where: { shop } });
        await db.shopInfo.deleteMany({
            where: {
                shop: {
                    contains: shop,
                },
            },
        });
        await db.abandonmentCart.deleteMany({
            where: {
                shop: {
                    contains: shop,
                },
            },
        })
        await db.shopCustomers.deleteMany({
            where: {
                shop: {
                    contains: shop,
                },
            },
        })

        return json({ status: "success" });
    } catch (error) {

        console.error("Error handling shop redact webhook:", error);
        return json({ status: "error", message: error.message }, { status: 500 });
    }

    return new Response();
};
