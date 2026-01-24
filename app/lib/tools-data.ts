import { Tool } from '@/app/types';

export const TOOLS: Tool[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // RECONNAISSANCE & ASSET DISCOVERY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amass',
    name: 'Amass',
    description: 'Advanced attack surface mapping and asset discovery',
    category: 'recon',
    type: 'cli',
    command: 'amass enum',
    flags: [
      { flag: '-d', description: 'Domain to enumerate', required: true, type: 'string', usesTarget: true },
      { flag: '-passive', description: 'Passive mode only', required: false, type: 'boolean', default: false },
      { flag: '-o', description: 'Output file path', required: false, type: 'string' },
    ],
    installed: false,
  },
  {
    id: 'subfinder',
    name: 'Subfinder',
    description: 'Fast subdomain enumeration with multiple sources',
    category: 'recon',
    type: 'cli',
    command: 'subfinder',
    flags: [
      { flag: '-d', description: 'Domain to find subdomains for', required: true, type: 'string', usesTarget: true },
      { flag: '-o', description: 'Output file', required: false, type: 'string' },
      { flag: '-silent', description: 'Silent mode', required: false, type: 'boolean', default: false },
    ],
    installed: false,
  },
  {
    id: 'assetfinder',
    name: 'Assetfinder',
    description: 'Find related domains and subdomains',
    category: 'recon',
    type: 'cli',
    command: 'assetfinder',
    flags: [
      { flag: '', description: 'Target domain', required: true, type: 'string', usesTarget: true },
      { flag: '--subs-only', description: 'Only include subdomains', required: false, type: 'boolean', default: false },
    ],
    installed: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DNS & DOMAIN INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'dnsx',
    name: 'DNSx',
    description: 'Fast DNS toolkit for multiple query types',
    category: 'dns',
    type: 'cli',
    command: 'dnsx',
    flags: [
      { flag: '-d', description: 'Domain to query', required: true, type: 'string', usesTarget: true },
      { flag: '-a', description: 'Query A records', required: false, type: 'boolean', default: true },
      { flag: '-aaaa', description: 'Query AAAA records', required: false, type: 'boolean', default: false },
      { flag: '-cname', description: 'Query CNAME records', required: false, type: 'boolean', default: false },
      { flag: '-mx', description: 'Query MX records', required: false, type: 'boolean', default: false },
      { flag: '-txt', description: 'Query TXT records', required: false, type: 'boolean', default: false },
    ],
    installed: false,
  },
  {
    id: 'shuffledns',
    name: 'ShuffleDNS',
    description: 'Mass DNS resolver with wildcard filtering',
    category: 'dns',
    type: 'cli',
    command: 'shuffledns',
    flags: [
      { flag: '-d', description: 'Domain to bruteforce', required: true, type: 'string', usesTarget: true },
      { flag: '-w', description: 'Wordlist path', required: true, type: 'string', default: '/usr/share/wordlists/subdomains.txt' },
      { flag: '-r', description: 'Resolvers file', required: false, type: 'string' },
    ],
    installed: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEB SCANNING & CRAWLING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'httpx',
    name: 'httpx',
    description: 'Fast HTTP toolkit for web reconnaissance',
    category: 'scanning',
    type: 'cli',
    command: 'httpx',
    flags: [
      { flag: '-u', description: 'URL to probe', required: false, type: 'string', usesTarget: true },
      { flag: '-l', description: 'List of URLs', required: false, type: 'string' },
      { flag: '-sc', description: 'Display status code', required: false, type: 'boolean', default: true },
      { flag: '-title', description: 'Display page title', required: false, type: 'boolean', default: true },
      { flag: '-tech-detect', description: 'Detect technologies', required: false, type: 'boolean', default: false },
      { flag: '-follow-redirects', description: 'Follow redirects', required: false, type: 'boolean', default: true },
    ],
    installed: false,
  },
  {
    id: 'nuclei',
    name: 'Nuclei',
    description: 'Fast vulnerability scanner with templates',
    category: 'scanning',
    type: 'cli',
    command: 'nuclei',
    flags: [
      { flag: '-u', description: 'Target URL', required: false, type: 'string', usesTarget: true },
      { flag: '-l', description: 'List of URLs', required: false, type: 'string' },
      { flag: '-t', description: 'Templates to run', required: false, type: 'string' },
      { flag: '-severity', description: 'Filter by severity (info,low,medium,high,critical)', required: false, type: 'string' },
      { flag: '-tags', description: 'Filter by tags', required: false, type: 'string' },
    ],
    installed: false,
  },
  {
    id: 'katana',
    name: 'Katana',
    description: 'Fast web crawler for endpoint discovery',
    category: 'scanning',
    type: 'cli',
    command: 'katana',
    flags: [
      { flag: '-u', description: 'Target URL', required: true, type: 'string', usesTarget: true },
      { flag: '-d', description: 'Crawl depth', required: false, type: 'number', default: 3 },
      { flag: '-jc', description: 'Enable JS crawling', required: false, type: 'boolean', default: true },
      { flag: '-kf', description: 'Known files detection', required: false, type: 'boolean', default: true },
    ],
    installed: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT DISCOVERY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ffuf',
    name: 'FFuf',
    description: 'Fast web fuzzer for content discovery',
    category: 'discovery',
    type: 'cli',
    command: 'ffuf',
    flags: [
      { flag: '-u', description: 'Target URL with FUZZ keyword', required: true, type: 'string', usesTarget: true },
      { flag: '-w', description: 'Wordlist path', required: true, type: 'string', default: '/usr/share/wordlists/dirb/common.txt' },
      { flag: '-mc', description: 'Match status codes', required: false, type: 'string', default: '200,301,302,403' },
      { flag: '-fc', description: 'Filter status codes', required: false, type: 'string' },
      { flag: '-fs', description: 'Filter response size', required: false, type: 'string' },
    ],
    installed: false,
  },
  {
    id: 'gau',
    name: 'GAU',
    description: 'Get All URLs from historical sources',
    category: 'discovery',
    type: 'cli',
    command: 'gau',
    flags: [
      { flag: '', description: 'Target domain', required: true, type: 'string', usesTarget: true },
      { flag: '--subs', description: 'Include subdomains', required: false, type: 'boolean', default: true },
      { flag: '--providers', description: 'Providers (wayback,commoncrawl,otx,urlscan)', required: false, type: 'string' },
    ],
    installed: false,
  },
  {
    id: 'gospider',
    name: 'GoSpider',
    description: 'Fast web spider for URL extraction',
    category: 'discovery',
    type: 'cli',
    command: 'gospider',
    flags: [
      { flag: '-s', description: 'Site to crawl', required: true, type: 'string', usesTarget: true },
      { flag: '-d', description: 'Depth limit', required: false, type: 'number', default: 2 },
      { flag: '-c', description: 'Concurrent requests', required: false, type: 'number', default: 5 },
      { flag: '--js', description: 'Find links in JS files', required: false, type: 'boolean', default: true },
    ],
    installed: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PORT & SERVICE SCANNING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'naabu',
    name: 'Naabu',
    description: 'Fast port scanner for service discovery',
    category: 'ports',
    type: 'cli',
    command: 'naabu',
    flags: [
      { flag: '-host', description: 'Target host', required: true, type: 'string', usesTarget: true },
      { flag: '-p', description: 'Ports to scan (- for all)', required: false, type: 'string', default: '-' },
      { flag: '-top-ports', description: 'Scan top N ports', required: false, type: 'number', default: 1000 },
      { flag: '-rate', description: 'Packets per second', required: false, type: 'number', default: 1000 },
    ],
    installed: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOUD ENUMERATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'cloudenum',
    name: 'Cloud Enum',
    description: 'Multi-cloud resource enumeration (AWS, Azure, GCP)',
    category: 'cloud',
    type: 'cli',
    command: 'cloud_enum',
    flags: [
      { flag: '-k', description: 'Keyword to search', required: true, type: 'string', usesTarget: true },
      { flag: '-m', description: 'Mutations file', required: false, type: 'string' },
      { flag: '-l', description: 'Logfile path', required: false, type: 'string' },
    ],
    installed: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL / WEB-BASED OSINT TOOLS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shodan',
    name: 'Shodan',
    description: 'Search engine for internet-connected devices',
    category: 'external',
    type: 'external',
    baseUrl: 'https://www.shodan.io',
    queryTemplate: 'https://www.shodan.io/search?query=hostname:{target}',
    externalLinks: [
      { label: 'Search by hostname', urlTemplate: 'https://www.shodan.io/search?query=hostname:{target}' },
      { label: 'Search by SSL cert', urlTemplate: 'https://www.shodan.io/search?query=ssl:{target}' },
      { label: 'Search by org', urlTemplate: 'https://www.shodan.io/search?query=org:"{target}"' },
    ],
  },
  {
    id: 'censys',
    name: 'Censys',
    description: 'Internet-wide scanning platform for asset discovery',
    category: 'external',
    type: 'external',
    baseUrl: 'https://search.censys.io',
    queryTemplate: 'https://search.censys.io/search?resource=hosts&q={target}',
    externalLinks: [
      { label: 'Search hosts', urlTemplate: 'https://search.censys.io/search?resource=hosts&q={target}' },
      { label: 'Search certificates', urlTemplate: 'https://search.censys.io/search?resource=certificates&q={target}' },
    ],
  },
  {
    id: 'crtsh',
    name: 'crt.sh',
    description: 'Certificate Transparency log search',
    category: 'external',
    type: 'external',
    baseUrl: 'https://crt.sh',
    queryTemplate: 'https://crt.sh/?q=%.{target}',
    externalLinks: [
      { label: 'Wildcard search', urlTemplate: 'https://crt.sh/?q=%.{target}' },
      { label: 'Exact match', urlTemplate: 'https://crt.sh/?q={target}' },
      { label: 'JSON output', urlTemplate: 'https://crt.sh/?q=%.{target}&output=json' },
    ],
  },
  {
    id: 'securitytrails',
    name: 'SecurityTrails',
    description: 'Historical DNS and domain data',
    category: 'external',
    type: 'external',
    baseUrl: 'https://securitytrails.com',
    queryTemplate: 'https://securitytrails.com/domain/{target}/dns',
    externalLinks: [
      { label: 'DNS records', urlTemplate: 'https://securitytrails.com/domain/{target}/dns' },
      { label: 'Historical data', urlTemplate: 'https://securitytrails.com/domain/{target}/history/a' },
      { label: 'Subdomains', urlTemplate: 'https://securitytrails.com/list/apex_domain/{target}' },
    ],
  },
  {
    id: 'dnsdumpster',
    name: 'DNSDumpster',
    description: 'DNS reconnaissance and research',
    category: 'external',
    type: 'external',
    baseUrl: 'https://dnsdumpster.com',
    queryTemplate: 'https://dnsdumpster.com/',
    externalLinks: [
      { label: 'Search domain', urlTemplate: 'https://dnsdumpster.com/' },
    ],
  },
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'Malware and URL scanner with reputation data',
    category: 'external',
    type: 'external',
    baseUrl: 'https://www.virustotal.com',
    queryTemplate: 'https://www.virustotal.com/gui/domain/{target}',
    externalLinks: [
      { label: 'Domain info', urlTemplate: 'https://www.virustotal.com/gui/domain/{target}' },
      { label: 'Subdomains', urlTemplate: 'https://www.virustotal.com/gui/domain/{target}/relations' },
      { label: 'DNS records', urlTemplate: 'https://www.virustotal.com/gui/domain/{target}/details' },
    ],
  },
  {
    id: 'wayback',
    name: 'Wayback Machine',
    description: 'Historical website snapshots',
    category: 'external',
    type: 'external',
    baseUrl: 'https://web.archive.org',
    queryTemplate: 'https://web.archive.org/web/*/{target}',
    externalLinks: [
      { label: 'Browse archives', urlTemplate: 'https://web.archive.org/web/*/{target}' },
      { label: 'CDX API', urlTemplate: 'https://web.archive.org/cdx/search/cdx?url=*.{target}&output=json&fl=original&collapse=urlkey' },
    ],
  },
  {
    id: 'builtwith',
    name: 'BuiltWith',
    description: 'Technology profiler and lookup',
    category: 'external',
    type: 'external',
    baseUrl: 'https://builtwith.com',
    queryTemplate: 'https://builtwith.com/{target}',
    externalLinks: [
      { label: 'Technology profile', urlTemplate: 'https://builtwith.com/{target}' },
    ],
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description: 'Domain registration information',
    category: 'external',
    type: 'external',
    baseUrl: 'https://who.is',
    queryTemplate: 'https://who.is/whois/{target}',
    externalLinks: [
      { label: 'WHOIS lookup', urlTemplate: 'https://who.is/whois/{target}' },
      { label: 'DNS lookup', urlTemplate: 'https://who.is/dns/{target}' },
    ],
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    description: 'Email finder and verifier',
    category: 'external',
    type: 'external',
    baseUrl: 'https://hunter.io',
    queryTemplate: 'https://hunter.io/search/{target}',
    externalLinks: [
      { label: 'Find emails', urlTemplate: 'https://hunter.io/search/{target}' },
    ],
  },
];

export const TOOL_CATEGORIES: Record<string, { label: string; color: string }> = {
  recon: { label: 'Reconnaissance', color: 'cyan' },
  dns: { label: 'DNS Intelligence', color: 'purple' },
  scanning: { label: 'Web Scanning', color: 'green' },
  discovery: { label: 'Content Discovery', color: 'amber' },
  ports: { label: 'Port Scanning', color: 'red' },
  cloud: { label: 'Cloud Enum', color: 'cyan' },
  osint: { label: 'OSINT', color: 'purple' },
  external: { label: 'External Tools', color: 'amber' },
};
