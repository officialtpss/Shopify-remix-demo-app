import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
    const { shop, payload, topic, session } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    //console.log(`payload---`,payload);

    try {
        const updateUser = await prisma.abandonmentCart.create({
            data: {
                shop: shop,
                customerEmail: payload.email,
                customerName: payload.customer?.first_name,
                customerPhone: payload.phone,
                cartToken: payload.cart_token,
                checkoutId: String(payload.id),
                customerId: String(payload.customer?.id),
                createdAt: payload.created_at,
                status: null
            }
        });
        return ('Success');
    }
    catch (error) {
        return ('Error:', error);
    }

    return new Response();
};
