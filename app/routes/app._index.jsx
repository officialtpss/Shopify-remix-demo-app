import {
    Card,
    Layout,
    Link,
    Page,
    Text,
    BlockStack,
    InlineStack,
    Button,
    TextField,
    Icon
} from "@shopify/polaris";
import {
    CheckIcon,
    XIcon
} from '@shopify/polaris-icons';
import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { authenticate } from "../shopify.server";
import "./style/style.css"

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const shopDomain = shop;

    if (!shopDomain) {
        throw new Response("Shop not authenticated", { status: 401 });
    }

    return ({ shopDomain });
};

export default function Index() {
    const [apikey, setApikey] = useState('');
    const { shopDomain } = useLoaderData();
    const [verifykey, setVerifykey] = useState(false);
    const [keyresp, setKeyresp] = useState(false);
    const [verifybtn, setVerifybtn] = useState(true);
    const handleChange = (value) => {
        setApikey(value);
    };


    const handleClick = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/save-apikey', new URLSearchParams({
                key: apikey,
                domain: shopDomain,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.error) {
                setVerifykey(false);
                setKeyresp(true);
                setVerifybtn(true)
            } else {
                setVerifykey(true);
                setKeyresp(false);
                setVerifybtn(false)
            }

        } catch (error) {
            console.error("Error calling API:", error);
        }
    };

    const handleRemove = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/removekey', new URLSearchParams({
                shop: shopDomain,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.error) {
                setVerifykey(true);
                setVerifybtn(true)
            } else {
                setVerifykey(false);
                setKeyresp(false);
                setVerifybtn(false)
                setApikey('');
            }

        } catch (error) {
            console.error("Error calling API:", error);
        }
    };

    useEffect(() => {

        if (shopDomain) {
            const fetchShopInfo = async () => {
                if (shopDomain) {
                    try {
                        const response = await axios.post("/api/getshop",
                            new URLSearchParams({
                                shop: shopDomain,
                            }),
                            {
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded",
                                }
                            }
                        );

                        if (response.data.error) {
                            console.log("Error fetching shop info--", response.data.error);
                            setVerifykey(false);
                            setVerifybtn(true)
                        } else {
                            setApikey(response.data.apikey);
                            setVerifykey(true);
                            setKeyresp(false)
                            setVerifybtn(false)
                        }

                    } catch (error) {
                        console.error("Error calling API:", error);
                    }
                }
            };

            fetchShopInfo();
        }
    }, [shopDomain]);

    return (
        <Page>
            {/* <TitleBar></TitleBar> */}
            <BlockStack gap="500">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="500">
                                <BlockStack gap="200">
                                    <InlineStack blockAlign="center" gap="100" wrap={false}>
                                        <Text as="h2" variant="headingMd">
                                            Welcome to Demoapp Shopify App {" "} {" "}
                                        </Text>
                                     
                                    </InlineStack>
                                    <Text variant="bodyMd" as="p">
                                        You will need a Demoapp API Key to use this app.
                                        If you don't have a Demoapp account yet, {" "}
                                        <Link
                                            url="https://site.demoapp.co.il/"
                                            target="_blank"
                                            removeUnderline
                                        >
                                            click here.
                                        </Link>
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="200">

                                    <TextField
                                        label="Enter API key"
                                        value={apikey}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />
                                </BlockStack>
                                {verifykey && (<InlineStack gap="100">
                                    <div className="left-align"><Icon
                                        source={CheckIcon}
                                        tone="success"
                                    /></div>
                                    <p>API key is varified successfully</p>
                                </InlineStack>)}
                                {keyresp && (<InlineStack gap="100">
                                    <div className="left-align"> <Icon
                                        source={XIcon}
                                        tone="critical"
                                    /></div>
                                    <p>API key is Invalid</p>
                                </InlineStack>)}
                                <InlineStack gap="300">
                                    {verifykey && (
                                        <div className="custom-button"><Button onClick={handleRemove}>
                                            Remove
                                        </Button></div>
                                    )}
                                    {verifybtn && (<div className="custom-button"><Button onClick={handleClick}>
                                        Verify
                                    </Button></div>)}

                                </InlineStack>

                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneThird">

                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
}
