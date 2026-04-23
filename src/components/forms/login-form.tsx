/** biome-ignore-all lint/correctness/noChildrenProp: TanStack Form Field/Subscribe use children as render prop */

import { useForm } from "@tanstack/react-form";
import type React from "react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
	email: z.email("Invalid email address"),
});

export function LoginForm({ ...props }: React.ComponentProps<"div">) {
	const id = useId();
	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await sendMagicLink(value.email);
		},
	});

	const sendMagicLink = async (email: string) => {
		await authClient.signIn.magicLink({
			email: email,
			callbackURL: "/",
			newUserCallbackURL: "/",
		});
		toast.success("Magic link sent!", {
			description: "Check your email inbox or spam folder for the link.",
		});
	};
	const [isGooglePending, setIsGooglePending] = useState(false);
	const signIn = async () => {
		setIsGooglePending(true);
		await authClient.signIn
			.social({
				provider: "google",
			})
			.catch(() => {
				setIsGooglePending(false);
			});
	};

	return (
		<div className={cn("flex flex-col gap-6", props.className)} {...props}>
			<FieldGroup>
				<div className="flex flex-col items-start gap-1">
					<h1 className="text-2xl font-bold">Login</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Enter your email to login
					</p>
				</div>
				<form
					id={id}
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<form.Field
						name="email"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Email:</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="you@yourcompany.com"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					<form.Subscribe
						selector={(state) => state.isSubmitting}
						children={(isSubmitting) => (
							<Button
								type="submit"
								form={id}
								disabled={isSubmitting}
								className="w-full"
							>
								{isSubmitting ? <Spinner /> : "Continue"}
							</Button>
						)}
					/>
				</form>

				<FieldSeparator className="bg-transparent">
					Or continue with
				</FieldSeparator>
				<Field className="mt-4">
					<Button
						variant="outline"
						type="button"
						className="text-white"
						onClick={signIn}
						disabled={isGooglePending}
					>
						{isGooglePending ? (
							<Spinner />
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								className="bi bi-google"
								viewBox="0 0 16 16"
							>
								<title>Google</title>
								<path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
							</svg>
						)}
						Continue with Google
					</Button>
				</Field>
			</FieldGroup>
		</div>
	);
}
