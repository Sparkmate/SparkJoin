import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import tailwindConfig from "./tailwind.config";

interface MagicLinkEmailProps {
  url: string;
  email?: string;
}

const baseUrl = process.env.BETTER_AUTH_URL;

export const MagicLinkEmail = ({ url, email }: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Tailwind config={tailwindConfig}>
      <Body className="bg-background font-sans p-8">
        <Preview>Sign in to Join Sparkmate</Preview>
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
            Sign in to Join Sparkmate
          </Heading>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-foreground">
            {email
              ? `Click the button below to sign in to your account.`
              : "Click the button below to sign in."}
          </Text>
          <Section className="py-[27px] px-0">
            <Button
              className="bg-primary text-black rounded-lg font-semibold text-[15px] no-underline text-center block py-[11px] px-[23px]"
              href={url}
            >
              Sign in
            </Button>
          </Section>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-muted-foreground">
            This link expires in 15 minutes. If you didn&apos;t request it, you
            can safely ignore this email.
          </Text>
          <Text className="mb-0 mx-0 mt-0 leading-[1.4] text-[14px] text-muted-foreground">
            If the button doesn&apos;t work, copy and paste this link into your
            browser:
          </Text>
          <Link href={url} className="text-[14px] text-primary break-all">
            {url}
          </Link>
          <Hr className="border-border mt-[42px] mb-[26px]" />
          <Link href={baseUrl} className="text-muted-foreground text-[14px]">
            Join Sparkmate
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

MagicLinkEmail.PreviewProps = {
  url: "https://example.com/callback/abc123",
  email: "you@example.com",
} as MagicLinkEmailProps;

export default MagicLinkEmail;
