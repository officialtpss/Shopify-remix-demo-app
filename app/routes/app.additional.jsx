import {
    Card,
    Layout,
    Page,
    Link,
    BlockStack,
    Text,
    Divider,
    Checkbox,
    Button,
    InlineGrid
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { useState ,useEffect} from "react";
import axios from "axios";

export async function loader({ request }) {
    const { admin } = await authenticate.admin(request);
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const shopDomain = shop;
    if (!shopDomain) {
        throw new Response("Shop not authenticated", { status: 401 });
    }
    
    const response = await admin.graphql(
        `#graphql
      query ThemeList {
        themes(first: 5 ,roles:MAIN) {
          nodes {
            id
            name
            role
          }
        }
      }`,
    );

    const data = await response.json();
    return ({ shopDomain, data });
}


export default function AdditionalPage() {
    const { shopDomain, data } = useLoaderData();
    const [webpixel, setWebpixel] = useState(false)
    const themeId = data.data.themes.nodes[0].id.match(/\d+$/)?.[0];
    const shopName = shopDomain.split(".")[0];
    const themeLink = "https://admin.shopify.com/store/" + shopName + "/themes/" + themeId + "/editor?context=apps";

    const handleWebpixel = () => {
        setWebpixel(!webpixel)
    };

    const handleSync = async () => {
        try {
            const params = new URLSearchParams({
                shop: shopDomain,
                webpixel:webpixel,
                type:"savetracking"
            });
            const response = await axios.post("/api/getgroups", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            });

            if (response.data == "success") {
                shopify.toast.show("Settings saved")
            }
            if (response.data.error) {
                console.log('Somthing went wrong')
            }

        } catch (error) {
            console.error("Error calling API:", error);
        }
    }

    useEffect(() => {
        if (shopDomain) {
            const fetchShopInfo = async () => {
                try {
                    const response = await axios.post("/api/getgroups", new URLSearchParams({
                        shop: shopDomain,
                        type: "getgroups"
                    }), {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        }
                    });

                    if (response.data.error) {
                        console.log("Error fetching shop info:", response.data.error);
                    } else {
                        if (response.data.shopinfo.webpixel == 1) {
                            setWebpixel(true);
                        }
                    }
                } catch (error) {
                    console.error("Error calling API:", error);
                }
            };
            fetchShopInfo();
        }
    }, [shopDomain]);
    
    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="300">
                            <Text as="p" variant="bodyMd">
                                Check below guidelines to activate page view and purchase tracking.
                            </Text>
                            <Divider borderColor="border" />
                        </BlockStack>

                        <BlockStack gap="200">
                            <Divider borderColor="transparent" />
                            <Text>To enable page view tracking <Link removeUnderline url={themeLink} target="_blank">
                                Click here
                            </Link></Text>
                            <Divider borderColor="transparent" />
                            <Text>Now you can see "Demoapp-Page-Track" extension.</Text>
                            <Divider borderColor="transparent" />
                            <Text>Toggle enable this extension.</Text>
                            <Divider borderColor="transparent" />
                            <Text>On the top right corner click on save button.</Text>
                            <Divider borderColor="transparent" />
                            <Text>Now your page view tracking enabled.</Text>
                            <Divider borderColor="transparent" />
                        </BlockStack>

                        <BlockStack gap="300">
                            <Divider borderColor="border" />
                            <Text as="p" variant="bodyMd">
                                To enable purchase tracking you need to check the checkbox below and click on save button.
                            </Text>

                            <InlineGrid gap="400" columns={2}>
                                <Checkbox
                                    label="Webpixel"
                                    checked={webpixel}
                                    onChange={handleWebpixel}
                                />
                                <div className="custom-button"><Text alignment="end"><Button onClick={handleSync} size="medium">Save</Button></Text></div>
                            </InlineGrid>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird"></Layout.Section>
            </Layout>
        </Page>
    );
}

