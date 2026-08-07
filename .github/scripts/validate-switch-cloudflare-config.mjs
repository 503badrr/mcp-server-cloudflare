import { readFile } from 'node:fs/promises'

const configPath = process.argv[2]

if (!configPath) {
	throw new Error('Usage: node validate-switch-cloudflare-config.mjs <wrangler.jsonc>')
}

const source = await readFile(configPath, 'utf8')
const json = source.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, '').replace(/,\s*([}\]])/g, '$1')
const config = JSON.parse(json)

const requiredSecrets = [
	'CLOUDFLARE_CLIENT_ID',
	'CLOUDFLARE_CLIENT_SECRET',
	'MCP_COOKIE_ENCRYPTION_KEY',
]

for (const secret of requiredSecrets) {
	if (!config.secrets?.required?.includes(secret)) {
		throw new Error(`Missing required secret declaration: ${secret}`)
	}

	if (Object.hasOwn(config.vars ?? {}, secret)) {
		throw new Error(`Secret must not be stored in vars: ${secret}`)
	}
}

if (config.env?.staging || config.env?.production) {
	throw new Error('staging/production must remain absent until Switch resources are provisioned')
}

if (config.workers_dev !== false || config.preview_urls !== false) {
	throw new Error('Unprovisioned config must not expose workers.dev or preview URLs')
}

const expectedPlaceholders = {
	kv: 'REPLACE_WITH_SWITCH_KV_NAMESPACE_ID',
	vectorize: 'REPLACE_WITH_SWITCH_VECTORIZE_INDEX',
	analytics: 'REPLACE_WITH_SWITCH_ANALYTICS_ENGINE_DATASET',
}

if (config.kv_namespaces?.[0]?.id !== expectedPlaceholders.kv) {
	throw new Error('OAUTH_KV must remain an explicit Switch-owned provisioning placeholder')
}

if (config.vectorize?.[0]?.index_name !== expectedPlaceholders.vectorize) {
	throw new Error('VECTORIZE must remain an explicit Switch-owned provisioning placeholder')
}

if (config.analytics_engine_datasets?.[0]?.dataset !== expectedPlaceholders.analytics) {
	throw new Error('MCP_METRICS must remain an explicit Switch-owned provisioning placeholder')
}

if ('account_id' in config || !config.name?.endsWith('-unprovisioned')) {
	throw new Error('Config must remain detached from an account and visibly unprovisioned')
}

const forbiddenUpstreamValues = [
	'6702657b6aa048cf3081ff3ff3c9c52f',
	'a6ad24203a244d248f2fe1acfeb7b3a3',
	'753f27a19ef94d7dbd49de05588ca890',
	'observability-staging.mcp.cloudflare.com',
	'observability.mcp.cloudflare.com',
	'sentry10.cfdata.org',
]

for (const value of forbiddenUpstreamValues) {
	if (source.includes(value)) {
		throw new Error(`Upstream Cloudflare value is forbidden in the Switch config: ${value}`)
	}
}

console.log('Switch Cloudflare deployment guard passed')
