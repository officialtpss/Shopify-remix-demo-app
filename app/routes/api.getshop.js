import prisma from "../db.server";
import axios from "axios";


export const action = async ({ request }) => {

    const formData = await request.formData();
    const shop = formData.get("shop");

    if (!shop) {
        return ({ error: "shop required" }, { status: 400 });
    }

    try {
        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: shop,
            },
        })
        
        if (shopInfo) {
            return ({ apikey: shopInfo.apiKey, webpixel: shopInfo.webpixel });
        } else {
            return ({ error: "Token not verified" });
        }
    } catch (error) {
        return ({ error: "Invalid REQUEST" });
    }
};
