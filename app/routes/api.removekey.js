import prisma from "../db.server";

export const action = async ({ request }) => {

    const formData = await request.formData();
    const shop = formData.get("shop");

    if (!shop) {
        return ({ error: "shop required" }, { status: 400 });
    }

    const shopInfo = await prisma.shopInfo.findFirst({
        where: {
            shop: shop,
        },
    });

    if (!shopInfo) {
        return ({ error: "Shop not found" }, { status: 404 });
    }

    await prisma.shopInfo.delete({
        where: {
            id: shopInfo.id,
        },
    });


    return ({ data: "successfuly deleted" });

};
