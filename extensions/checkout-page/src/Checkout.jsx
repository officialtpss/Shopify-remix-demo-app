import {
  BlockStack,
  reactExtension,
  Text,
  useApi,
  useEffect
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.thank-you.header.render-after',
  () => <Extension />,
);

function Extension() {
  const {cost, shop} = useApi();
  console.log('checkout------')
  return (
    <BlockStack>
      <Text>Shop name: {shop.name}</Text>
      <Text>cost: {cost.totalAmount}</Text>
    </BlockStack>
  );
}
