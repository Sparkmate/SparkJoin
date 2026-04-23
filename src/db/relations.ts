import { relations } from "drizzle-orm/relations";
import { user, account, session, oauthApplication, oauthAccessToken, oauthConsent, teammates, teammateLegalForms } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	oauthAccessTokens: many(oauthAccessToken),
	oauthApplications: many(oauthApplication),
	oauthConsents: many(oauthConsent),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const oauthAccessTokenRelations = relations(oauthAccessToken, ({one}) => ({
	oauthApplication: one(oauthApplication, {
		fields: [oauthAccessToken.clientId],
		references: [oauthApplication.clientId]
	}),
	user: one(user, {
		fields: [oauthAccessToken.userId],
		references: [user.id]
	}),
}));

export const oauthApplicationRelations = relations(oauthApplication, ({one, many}) => ({
	oauthAccessTokens: many(oauthAccessToken),
	user: one(user, {
		fields: [oauthApplication.userId],
		references: [user.id]
	}),
	oauthConsents: many(oauthConsent),
}));

export const oauthConsentRelations = relations(oauthConsent, ({one}) => ({
	oauthApplication: one(oauthApplication, {
		fields: [oauthConsent.clientId],
		references: [oauthApplication.clientId]
	}),
	user: one(user, {
		fields: [oauthConsent.userId],
		references: [user.id]
	}),
}));

export const teammateLegalFormsRelations = relations(teammateLegalForms, ({one}) => ({
	teammate: one(teammates, {
		fields: [teammateLegalForms.teammateId],
		references: [teammates.id]
	}),
}));

export const teammatesRelations = relations(teammates, ({many}) => ({
	teammateLegalForms: many(teammateLegalForms),
}));