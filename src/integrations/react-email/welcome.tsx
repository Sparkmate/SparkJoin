import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import tailwindConfig from "./tailwind.config";

interface WelcomeEmailProps {
  name?: string;
  email: string;
}

const baseUrl = process.env.BETTER_AUTH_URL;

export const WelcomeEmail = ({ name, email }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind config={tailwindConfig}>
        <Body className="bg-background font-sans p-8">
          <Preview>Welcome to Sparkmate JOin</Preview>
          <Container className="mx-auto my-0 max-w-[560px] px-0 pt-5 pb-12">
            <Img
              src={
                "https://cdn.brandfetch.io/id0nvnoUuq/w/800/h/792/theme/light/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1764301281921"
              }
              width="200"
              height="150"
              alt="Hub"
              className="rounded-lg w-[50px] h-[50px]"
            />
            <Heading className="text-[24px] tracking-[-0.5px] leading-[1.3] font-normal text-foreground pt-[17px] px-0 pb-0 font-serif">
              Welcome to Sparkmate Join
            </Heading>
            <Text className="mb-[15px] mx-0 mt-4 leading-[1.4] text-[15px] text-foreground">
              {name ? `Hi ${name},` : "Hi,"}
            </Text>
            <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-foreground">
              Thanks for signing up to Sparkmate Join. Welcome to the platform!
              We're happy to have you here.
            </Text>
            <Hr className="border-border mt-[32px] mb-[20px]" />
            <Text className="text-muted-foreground text-[14px]">
              Signed up with: {email}
            </Text>
            <Link href={baseUrl} className="text-muted-foreground text-[14px]">
              Sparkmate Hub
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  name: "Alex Johnson",
  email: "alex@example.com",
} as WelcomeEmailProps;

export default WelcomeEmail;
