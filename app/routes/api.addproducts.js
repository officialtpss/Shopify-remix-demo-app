import prisma from "../db.server";
import axios from "axios";

export const action = async ({ request }) => {
    const formData = await request.formData();
    const shop = formData.get("shop");
    let hasNextPage = true;
    let afterCursor = null;
    const allProducts = [];
    try {

        const users = await prisma.session.findFirst({
            where: {
                shop: shop,
            },
        })
        const shopInfo = await prisma.shopInfo.findFirst({
            where: {
                shop: shop,
            },
        })

        while (hasNextPage) {
            try {
                const query = `
                    query GetProducts($first: Int, $after: String) {
                    products(first: $first, after: $after) {
                        edges {
                        node {
                            handle
                            title
                            collections(first:50){
                                nodes{
                                    title
                                }
                            }
                            variants(first:100){
                            nodes{
                                id
                                title
                                price
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
                        cursor
                        }
                        pageInfo {
                        hasNextPage
                        }
                    }
                    }
                `;

                const variables = {
                    first: 50,
                    after: afterCursor,
                };

                const response = await axios.post(
                    `https://${shop}/admin/api/2024-10/graphql.json`,
                    { query, variables },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Shopify-Access-Token': users.accessToken,
                        },
                    }
                );

                const { edges, pageInfo } = response.data.data.products;
                edges.map(edge => {
                    for (const item of edge.node.variants.nodes) {
                        allProducts.push({
                            productID: item.id,
                            productCategoryName: edge.node.collections?.nodes
                                ?.map((collection) => collection.title)
                                .join(",") || "",
                            imagesUrl: edge.node.featuredMedia?.preview?.image.url,
                            name: item.title,
                            price: item.price,
                            hrefUrl: "https://" + shop + "/products/" + edge.node.handle
                        });
                    }
                });

                while (allProducts.length >= 40) {
                    const data = {
                        products: allProducts,
                        eventSource: "Shopify"
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
                        const chunk = allProducts.splice(0, 40);
                        console.log('Products imported to pulseem')
                    } else {
                        console.log('Error products imported to pulseem')
                    }
                }

                hasNextPage = pageInfo.hasNextPage;
                afterCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

            } catch (error) {
                console.error('Error fetching products:', error.response?.data || error.message);
                break;
            }
        }

        if (allProducts.length > 0) {
            const data = {
                products: allProducts,
                eventSource: "Shopify"
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
                return ("success");
            } else {
                return ("Error");
            }

        }


    } catch (error) {
        console.error("Error :", error);
        return new Response("Failed to fetch data", { status: 500 });
    }

}