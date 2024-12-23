import {
    Card,
    Layout,
    Page,
    Text,
    BlockStack,
    Checkbox,
    InlineStack,
    Button,
    Tag,
    Icon,
    Combobox,
    Popover,
    InlineGrid
} from "@shopify/polaris";
import { SearchIcon, RefreshIcon } from '@shopify/polaris-icons';
import { useEffect, useState, useCallback, useMemo } from "react";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
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

export default function TrackingPage() {
    const { shopDomain } = useLoaderData();
    const [checkedSignup, setCheckedSignup] = useState(false);
    const [checkedCart, setCheckedCart] = useState(false);
    const [checkedPurchase, setCheckedPurchase] = useState(false);

    const [inputValue, setInputValue] = useState('');
    const [selectedSignup, setSelectedSignup] = useState([]);
    const [selectedCart, setSelectedCart] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState([]);
    const [popoverSignup, setPopoverSignup] = useState(false);
    const [popoverCart, setPopoverCart] = useState(false);
    const [popoverPurchase, setPopoverPurchase] = useState(false);
    const [allgroups, setAllgroups] = useState([]);
    const [isChecked, setIsChecked] = useState(false);

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };
    const handleSync = async () => {
        shopify.toast.show("The app is syncing product data, which may take 2 to 3 minutes.")
        try {
            const params = new URLSearchParams({
                shop: shopDomain,
            });
            const response = await axios.post("/api/addproducts", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            });

            if (response.data == "success") {
                shopify.toast.show("Products synced successfully.")
            }
            if (response.data.error) {
                console.log('Somthing went wrong')
            }

        } catch (error) {
            console.error("Error calling API:", error);
        }
    }
    const handleChangeSignup = useCallback(
        (newChecked) => {
            setCheckedSignup(newChecked);
            if (newChecked == false) {
                setSelectedSignup([])
            }
        },
        []
    );

    const updateText = useCallback(
        (value) => {
            setInputValue(value);
        }
    );

    const handleChangeCart = useCallback(
        (newChecked) => {
            setCheckedCart(newChecked);
            if (newChecked == false) {
                setSelectedCart([])
            }
        },
        []
    );
    const handleChangePurchase = useCallback(
        (newChecked) => {
            setCheckedPurchase(newChecked);
            if (newChecked == false) {
                setSelectedPurchase([])
            }
        },
        []
    );

    const togglePopoverSignup = useCallback(() => {
        setPopoverSignup((prev) => {
            const newState = !prev;
            if (newState) setInputValue('');
            return newState;
        });
    }, []);


    const togglePopoverCart = useCallback(() => {
        setPopoverCart((prev) => {
            const newState = !prev;
            if (newState) setInputValue('');
            return newState;
        });
    }, []);

    const togglePopoverPurchase = useCallback(() => {
        setPopoverPurchase((prev) => {
            const newState = !prev;
            if (newState) setInputValue('');
            return newState;
        });
    }, []);


    const handleoptChangeSignup = useCallback((groupId) => {
        setSelectedSignup((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        );
    }, []);

    const handleoptChangeCart = useCallback((groupId) => {
        setSelectedCart((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        );
    }, []);

    const handleoptChangePrchase = useCallback((groupId) => {
        setSelectedPurchase((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        );
    }, []);


    const submitFunct = async () => {
        let newSignup = 0;
        let cartAbandonment = 0;
        let purchase = 0;
        if (allgroups.length <= 0) {
            shopify.toast.show("Please verify API key first");
            return;
        }
        if (checkedSignup == false && checkedCart == false && checkedPurchase == false) {
            shopify.toast.show("Please check at least one option");
            return;
        }
        if (checkedSignup == true) {
            newSignup = 1
            if (selectedSignup.length <= 0) {
                shopify.toast.show("Please add at least one group for new sign-up");
                return;
            }
        }

        if (checkedCart == true) {
            cartAbandonment = 1
            if (selectedCart.length <= 0) {
                shopify.toast.show("Please add at least one group for cart-abandonment");
                return;
            }
        }

        if (checkedPurchase == true) {
            purchase = 1
            if (selectedPurchase.length <= 0) {
                shopify.toast.show("Please add at least one group for purchase");
                return;
            }
        }

        try {

            const params = new URLSearchParams({
                shop: shopDomain,
                type: "savegroups",
                signupGroup: selectedSignup,
                cartGroup: selectedCart,
                purchaseGroup: selectedPurchase,
                newSignup: newSignup,
                cartAbandonment: cartAbandonment,
                purchase: purchase
            });
            if (isChecked) {
                params.append("productsync", 1);
                params.append("productautosync", 1);
            }
            if (!isChecked) {
                params.append("productautosync", 0);
            }

            const response = await axios.post("/api/getgroups", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            });

            if (response.data.error) {
                shopify.toast.show("Somthing went wrong!");
            } else {
                shopify.toast.show("Settings saved");
            }

        } catch (error) {
            console.error("Error ", error);
        }

    };

    const activatorSignup = (
        <Button onClick={togglePopoverSignup} disclosure>
            {selectedSignup.length > 0
                ? `${selectedSignup.length} selected`
                : allgroups.length === 0
                    ? 'No groups available'
                    : 'Select Groups'
            }
        </Button>
    );

    const activatorCart = (
        <Button onClick={togglePopoverCart} disclosure>
            {selectedCart.length > 0
                ? `${selectedCart.length} selected`
                : allgroups.length === 0
                    ? 'No groups available'
                    : 'Select Groups'
            }
        </Button>
    );

    const activatorPurchase = (
        <Button onClick={togglePopoverPurchase} disclosure >
            {selectedPurchase.length > 0
                ? `${selectedPurchase.length} selected`
                : allgroups.length === 0
                    ? 'No groups available'
                    : 'Select Groups'
            }
        </Button>

    );


    const SignTagMarkup = selectedSignup.map((option) => {
        const signmatchedGroup = allgroups.find((group) => group.groupId === option);
        return (
            <Tag size="large" key={option}>
                {signmatchedGroup ? signmatchedGroup.groupName : option}
            </Tag>
        );
    });

    const CartTagMarkup = selectedCart.map((option) => {
        const cartmatchedGroup = allgroups.find((group) => group.groupId === option);
        return (
            <Tag size="large" key={option}>
                {cartmatchedGroup ? cartmatchedGroup.groupName : option}
            </Tag>
        );
    });

    const PurchaseTagMarkup = selectedPurchase.map((option) => {
        const purchmatchedGroup = allgroups.find((group) => group.groupId === option);
        return (
            <Tag size="large" key={option}>
                {purchmatchedGroup ? purchmatchedGroup.groupName : option}
            </Tag>
        );
    });


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
                        if (response.data.groups) {
                            setAllgroups(response.data.groups);
                        }
                        if(response.data.shopinfo){
                            if (response.data.shopinfo.signupGroup) {
                                const parsedSignupGroup = response.data.shopinfo.signupGroup.split(',').map(Number);
                                const matchingValues = parsedSignupGroup.filter((option) =>
                                    response.data.groups.some((group) => group.groupId === option)
                                );
                                setSelectedSignup(matchingValues);
                            }

                            if (response.data.shopinfo.cartGroup) {
                                const parsedCartGroup = response.data.shopinfo.cartGroup.split(',').map(Number);
                                const matchingValuesCart = parsedCartGroup.filter((option) =>
                                    response.data.groups.some((group) => group.groupId === option)
                                );
                                setSelectedCart(matchingValuesCart);
                            }

                            if (response.data.shopinfo.purchaseGroup) {
                                const parsedPurchaseGroup = response.data.shopinfo.purchaseGroup.split(',').map(Number);
                                const matchingValuesPurchase = parsedPurchaseGroup.filter((option) =>
                                    response.data.groups.some((group) => group.groupId === option)
                                );
                                setSelectedPurchase(matchingValuesPurchase);
                            }

                            if (response.data.shopinfo.newSignup == 1) {
                                setCheckedSignup(true)
                            }
                            if (response.data.shopinfo.cartAbandonment == 1) {
                                setCheckedCart(true)
                            }
                            if (response.data.shopinfo.purchase == 1) {
                                setCheckedPurchase(true)
                            }
                            if (response.data.shopinfo.productAutosync == 1) {
                                setIsChecked(true);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error calling API:", error);
                }
            };
            fetchShopInfo();
        }
    }, [shopDomain]);

    const Placeholder = ({ height = 'auto' }) => {
        return (
            <div
                style={{
                    height: height,
                }}
            />
        );
    };
    const filteredGroups = useMemo(
        () =>
            allgroups.filter(({ groupName }) =>
                groupName.toLowerCase().includes(inputValue.toLowerCase())
            ),
        [allgroups, inputValue]
    );

    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="300">
                            <Text as="p" variant="bodyMd">
                                Check the checkboxes below to track events.
                            </Text>
                            <Card>
                                <div className="custom-checkbox"><Checkbox
                                    label="New Sign-Up"
                                    checked={checkedSignup}
                                    onChange={handleChangeSignup}
                                /></div>
                                <Placeholder height="10px" />
                                <InlineStack>

                                    <Text as="h2" variant="bodyMd">
                                        Activating this event will insert new site members into the Demoapp groups you selected.
                                    </Text>
                                </InlineStack>
                                <Placeholder height="10px" />
                                {checkedSignup && (<>
                                    <InlineStack gap="200" wrap={false} blockAlign="center">
                                        {SignTagMarkup}
                                    </InlineStack>
                                    <Placeholder height="10px" />
                                    <InlineStack>
                                        <Popover
                                            active={popoverSignup}
                                            activator={activatorSignup}
                                            onClose={togglePopoverSignup}
                                        >
                                            <Popover.Pane>
                                                <div style={{ padding: '16px' }}>
                                                    <Combobox
                                                        allowMultiple
                                                        activator={
                                                            <Combobox.TextField
                                                                prefix={<Icon source={SearchIcon} />}
                                                                onChange={updateText}
                                                                label="Search Groups"
                                                                labelHidden
                                                                value={inputValue}
                                                                placeholder="Search Groups"
                                                                autoComplete="off"
                                                            />
                                                        }
                                                    ></Combobox>
                                                    <BlockStack>
                                                        {filteredGroups.map(({ groupId, groupName }) => (
                                                            <Checkbox
                                                                key={groupId}
                                                                label={groupName}
                                                                checked={selectedSignup.includes(groupId)}
                                                                onChange={() => handleoptChangeSignup(groupId)}
                                                            />
                                                        ))}
                                                    </BlockStack>
                                                </div>
                                            </Popover.Pane>
                                        </Popover></InlineStack></>)}
                            </Card>
                            <Card>
                                <div className="custom-checkbox"> <Checkbox
                                    label="Purchase"
                                    checked={checkedPurchase}
                                    onChange={handleChangePurchase}
                                /></div>
                                <Placeholder height="10px" />
                                <InlineStack>
                                    <Text as="h2" variant="bodyMd">
                                        Activating this event will insert new customers into the Demoapp groups you selected.
                                    </Text>
                                </InlineStack>
                                <Placeholder height="10px" />
                                {checkedPurchase && (<>
                                    <InlineStack gap="200" wrap={false} blockAlign="center">
                                        {PurchaseTagMarkup}
                                    </InlineStack>
                                    <Placeholder height="10px" />
                                    <InlineStack>
                                        <Popover
                                            active={popoverPurchase}
                                            activator={activatorPurchase}
                                            onClose={togglePopoverPurchase}
                                        >
                                            <Popover.Pane>
                                                <div style={{ padding: '16px' }}>
                                                    <Combobox
                                                        allowMultiple
                                                        activator={
                                                            <Combobox.TextField
                                                                prefix={<Icon source={SearchIcon} />}
                                                                onChange={updateText}
                                                                label="Search Groups"
                                                                labelHidden
                                                                value={inputValue}
                                                                placeholder="Search Groups"
                                                                autoComplete="off"
                                                            />
                                                        }
                                                    ></Combobox>
                                                    <BlockStack>
                                                        {filteredGroups.map(({ groupId, groupName }) => (
                                                            <Checkbox
                                                                key={groupId}
                                                                label={groupName}
                                                                checked={selectedPurchase.includes(groupId)}
                                                                onChange={() => handleoptChangePrchase(groupId)}
                                                            />
                                                        ))}
                                                    </BlockStack>
                                                </div>
                                            </Popover.Pane>
                                        </Popover>
                                    </InlineStack></>)}
                            </Card>
                            <Card>
                                <div className="custom-checkbox"><Checkbox
                                    label="Cart Abandonment"
                                    checked={checkedCart}
                                    onChange={handleChangeCart}
                                /></div>
                                <InlineStack>
                                    <Placeholder height="10px" />
                                    <BlockStack>
                                        <Text as="h2" variant="bodyMd">
                                            Activating this event will insert customers who didn't finish their checkout process into the Demoapp groups you selected.
                                        </Text>
                                        {checkedCart && (<>
                                            <InlineStack>
                                                <Text variant="headingSm" as="h6">
                                                    Shopify's cart abandonment event is triggered after approximately 30 minutes.
                                                </Text>
                                            </InlineStack>

                                            <Placeholder height="10px" />
                                            <InlineStack gap="200" wrap={false} blockAlign="center">
                                                {CartTagMarkup}
                                            </InlineStack>
                                            <Placeholder height="10px" />
                                            <Popover
                                                active={popoverCart}
                                                activator={activatorCart}
                                                onClose={togglePopoverCart}
                                            >
                                                <Popover.Pane>
                                                    <div style={{ padding: '16px' }}>
                                                        <Combobox
                                                            allowMultiple
                                                            activator={
                                                                <Combobox.TextField
                                                                    prefix={<Icon source={SearchIcon} />}
                                                                    onChange={updateText}
                                                                    label="Search Groups"
                                                                    labelHidden
                                                                    value={inputValue}
                                                                    placeholder="Search Groups"
                                                                    autoComplete="off"
                                                                />
                                                            }
                                                        ></Combobox>
                                                        <BlockStack>
                                                            {filteredGroups.map(({ groupId, groupName }) => (
                                                                <Checkbox
                                                                    key={groupId}
                                                                    label={groupName}
                                                                    checked={selectedCart.includes(groupId)}
                                                                    onChange={() => handleoptChangeCart(groupId)}
                                                                />
                                                            ))}
                                                        </BlockStack>
                                                    </div>
                                                </Popover.Pane>
                                            </Popover>
                                        </>)}
                                    </BlockStack>
                                </InlineStack>
                            </Card>
                            <Card>
                                <Text as="h2" variant="bodyMd">
                                    <span className="heading-text">Product Synchronization</span>
                                </Text>
                                <Placeholder height="10px" />
                                <InlineGrid gap="400" columns={2}>
                                    <Text as="h6" variant="bodyMd">
                                        Enable Product Synchronization
                                    </Text>
                                    <Text
                                        alignment="end"
                                    >
                                        <label className="switch">
                                            <input type="checkbox" checked={isChecked} onChange={handleToggle} />
                                            <span className="slider round"></span>
                                        </label>
                                    </Text>
                                </InlineGrid>
                                <Placeholder height="10px" />
                                <div className="custom-button"><Button onClick={handleSync}>
                                    <InlineStack blockAlign="center"><Icon
                                        source={RefreshIcon}
                                        tone="base"
                                    /> Sync Store Products Now</InlineStack>
                                </Button>
                                </div>
                            </Card>

                            <InlineStack gap="300">
                                <div className="custom-button"><Button onClick={submitFunct}>
                                    Submit
                                </Button>
                                </div>
                            </InlineStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    {/* Additional content can go here */}
                </Layout.Section>
            </Layout>
        </Page>
    );
}





