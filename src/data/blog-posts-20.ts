// Batch 20 of SEO/AEO articles. Same contract as blog-posts.ts.
// DISCLAIMER: Informational only — not professional tax or legal advice.
// Readers should consult a tax adviser for their specific situation.
// Claims are general EU/national context; thresholds are publicly available
// from each country's tax authority as of September 2026.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_20: BlogPost[] = [
  {
    slug: "vinted-reselling-tax-guide-eu",
    title: "Vinted Reselling Tax: What EU Sellers Need to Know in 2026",
    seoTitle: "Vinted Reselling Tax Guide 2026 (EU) — Resale IQ",
    description:
      "Does Vinted report your sales to the tax authority? What's the threshold before you owe tax? How to calculate profit and keep records. A plain-language guide for EU resellers in 2026.",
    date: "2026-09-15",
    category: "Reselling Basics",
    readMins: 11,
    preflightQuery: "New Balance 550",
    intro:
      "Since 2023, Vinted is required by EU law to report seller data to national tax authorities. Most casual sellers owe nothing — but the rules differ by country, and 'I didn't know' is not a defence once HMRC or the Belgian tax service has your transaction log. This guide covers the actual thresholds, what profit means in tax terms, and what records you need if you sell regularly.",
    definedTerm: {
      name: "DAC7",
      description:
        "DAC7 (EU Directive 2021/514) requires digital platforms like Vinted to report seller transaction data — total sales value, number of transactions, account details — to the tax authority in the seller's country each January. The rule applies to sellers who exceed 30 transactions OR €2,000 in gross sales in a calendar year. Below both thresholds, no report is filed. Above either, the platform reports regardless of whether the seller thinks the income is taxable.",
    },
    sections: [
      {
        h: "DAC7: Why Vinted now reports your sales",
        p: [
          "The EU's DAC7 directive (Directive 2021/514, transposed into national law from January 2023) requires all digital platforms operating in the EU — including Vinted — to collect and report seller data to the relevant national tax authority once per year.",
          "The reporting trigger is **30 transactions OR €2,000 gross sales** in a calendar year. If you sell 31 items at €1 each, Vinted files a report. If you sell 5 items at €500 each, Vinted files a report. Below both thresholds simultaneously, no report is filed.",
          "What gets reported: your full name, address, date of birth, national identification number, tax ID (if Vinted has it), bank account details, total sales amount, and transaction count. The tax authority then cross-references this against your tax return.",
          "This does not mean you automatically owe tax. Whether you owe anything depends on your country's rules about occasional versus professional selling — covered in the sections below.",
        ],
      },
      {
        h: "Occasional selling vs professional selling: the line that matters",
        p: [
          "Every EU country distinguishes between **occasional selling** (selling your own used personal belongings at a loss — generally not taxable) and **professional or commercial selling** (buying to resell for profit — generally taxable as business income).",
          "If you are reselling — buying items with the intention of selling them at a profit — you are almost certainly on the professional/commercial side of that line, regardless of volume. The intention to profit, not the volume, is often the legal test.",
          "The safest framing: if you use Resale IQ to calculate buy-below prices and source items specifically to resell them at a departure-price premium, you are operating commercially. That means your profit is taxable income in most EU countries. The question is whether your volume crosses the threshold at which your tax authority is likely to act on it.",
        ],
      },
      {
        h: "Country-by-country thresholds (2026)",
        p: [
          "These are publicly available general thresholds from each country's tax authority as of September 2026. Rules change; verify with a local tax adviser before the January filing deadline. **This is not professional tax advice.**",
          "**France:** The URSSAF threshold for occasional online resellers is €3,000/year in gross sales OR 20 transactions (reduced from 34 in 2024). Above either limit, declaration is mandatory. Occasional reselling of personal goods (clothes you personally owned and wore) is exempt from VAT and income tax below €5,000 if not bought with resale intent. Reselling for profit is taxable as BIC (industrial and commercial profits) from the first euro.",
          "**Germany:** The Finanzamt considers reselling taxable from the first transaction if the intent to profit exists (Gewinnerzielungsabsicht). The small-business exemption (Kleinunternehmerregelung) exempts income up to €22,000/year from VAT, but income tax still applies on profit. A Gewerbeanmeldung (business registration) may be required once you exceed a regular pattern of reselling.",
          "**Netherlands:** Belastingdienst distinguishes between 'result from other activities' (ROW) and business income. Regular reselling for profit is taxable under ROW from the first euro of profit, even without a formal business registration. The €1,800/year small-business exemption (KOR) applies to VAT only, not income tax.",
          "**Belgium:** The Federal Public Service Finance considers systematic reselling taxable as miscellaneous income or professional income. Occasional resale of personal items is generally exempt. A pattern of buying and reselling crosses into professional territory quickly.",
          "**Spain:** Agencia Tributaria requires declaration of earnings from economic activities from the first euro. If you are buying to resell (not just clearing personal items), it is treated as economic activity. The módulos simplified regime applies to small traders.",
          "**General rule for all EU markets:** If you are profitable and you are doing it repeatedly, declare it. The DAC7 report means your tax authority will have the gross sales number — if your declared income does not include it, that creates a mismatch.",
        ],
        cta: pricingMidCta("ctr_tax_20260915"),
      },
      {
        h: "How to calculate profit for tax purposes",
        p: [
          "Gross sales on the platform is not profit. Taxable profit in reselling is roughly: **sale price − cost of goods − platform fees − shipping − other direct costs**.",
          "For Vinted: sale price × 0.95 ≈ what you receive after the ~5% Vinted deduction (varies slightly by country and listing type). Subtract the price you paid for the item. Subtract any shipping materials. What remains is your taxable margin on that transaction.",
          "Example: You buy a Stone Island hoodie for €30 at a charity shop. It sells on Vinted at €72. After Vinted's 5% deduction, you receive ~€68.40. Taxable profit: €68.40 − €30 − €1.50 (packaging) = €36.90.",
          "Resale IQ's buy-below calculation models this: `departure average × 0.95 × 0.70`. The 0.95 is the platform-fee model; the 0.70 represents 30% of the net proceeds as your target margin. If you are consistently hitting that 30% margin, that is approximately what you would declare as profit per transaction.",
          "The departure average you see in the [flip tracker](" + ilinkHref("flip") + ") is based on watched listings across EU Vinted markets — use it as the reference price for your records.",
        ],
      },
      {
        h: "Record keeping: what to log for each transaction",
        p: [
          "Whether or not you owe tax today, building a records habit now protects you if a tax authority queries a future year. The minimum records for each transaction:",
          "1. Item description (brand, type, condition)\n2. Purchase price and where you bought it (charity shop, flea market, eBay — keep receipts where possible)\n3. Sale price and date\n4. Platform fee deducted\n5. Shipping cost\n6. Net profit on the transaction",
          "A spreadsheet with one row per item is sufficient. The detailed guide to what fields matter is at [record keeping for resellers](/blog/record-keeping-resellers).",
          "Resale IQ's buy-below tool already gives you the expected margin before you source. If you record your actual buy price alongside the departure average at the time of purchase, your margin log is largely built from the platform's data.",
        ],
      },
      {
        h: "Do you need to register a business?",
        p: [
          "If you are turning a consistent profit from reselling, the practical question is not 'can I avoid registering' but 'when does registering become cheaper than the risk of not registering'.",
          "A registered micro-business or sole trader gives you access to deductible expenses that reduce your taxable income: sourcing mileage, packaging, subscription tools like Resale IQ, a proportion of your phone bill. A side-hustle with €15k gross and €6k in deductible costs has a very different tax bill from one declared as €15k flat.",
          "Registration thresholds vary: in Germany, a Gewerbeanmeldung costs ~€30 and is required once reselling is systematic; in the Netherlands, KVK registration applies when you cross the line from occasional to regular commercial activity; in France, auto-entrepreneur status is available from the first transaction and caps at €77,700/year.",
          "The question to ask your tax adviser: 'I am buying secondhand clothing at charity shops and flea markets and reselling it on Vinted for a consistent 20–30% margin — should I register, and what expenses can I deduct?' That framing gets you a specific, useful answer.",
        ],
      },
      {
        h: "What to do before the end of 2026",
        p: [
          "1. **Pull your Vinted transaction history** for 2026. The app shows total earnings under Profile → My sales. Note the gross figure and transaction count.",
          "2. **Check if you crossed the DAC7 reporting threshold** (30 transactions OR €2,000 gross). If yes, Vinted will file a report in January 2027. Your tax return should account for this.",
          "3. **Calculate your profit** using the method above. Gross sales minus buy price, fees, shipping. If the profit is material (above a few hundred euros), consult a tax adviser in your country.",
          "4. **Start logging every transaction** from today with purchase date, buy price, sale price, and net profit. A simple spreadsheet is enough.",
          "5. **If you are operating at scale** (multiple items per week, consistent profit), consider registering as a sole trader or micro-business before year-end so 2026 expenses are deductible.",
          "The goal is not to pay more than you owe — it is to not get a surprise bill in 2027 for 2026 income that was visible in the DAC7 report but missing from your return.",
        ],
      },
    ],
    faq: [
      {
        q: "Does Vinted report sales to tax authorities?",
        a: "Yes. Under the EU DAC7 directive, Vinted reports seller data to the relevant national tax authority each January for sellers who exceeded 30 transactions OR €2,000 in gross sales in the previous calendar year. The report includes total sales value, transaction count, and personal identification details. Below both thresholds simultaneously, no report is filed.",
      },
      {
        q: "How much can I sell on Vinted before I pay tax?",
        a: "There is no universal EU threshold. The DAC7 reporting trigger (30 transactions or €2,000) is a data-sharing rule, not a tax exemption. Whether you owe tax on what Vinted reports depends on your country's rules. If you are buying items with the intention of reselling them at a profit, most EU countries treat that as taxable commercial income from the first euro of profit, regardless of volume. Occasional sale of personal belongings at a loss is usually exempt.",
      },
      {
        q: "Is reselling on Vinted legal?",
        a: "Yes. Reselling on Vinted is legal across the EU. The obligation is to declare taxable profit to your national tax authority — not to stop reselling. As long as you keep accurate records and declare income where required, reselling at any scale is a legal commercial activity.",
      },
      {
        q: "Do I need to register a business to resell on Vinted?",
        a: "Depends on the country and your scale. In Germany, regular commercial reselling generally requires a Gewerbeanmeldung. In the Netherlands, KVK registration applies once activity becomes regular. In France, auto-entrepreneur status is optional but simplifies tax treatment. If you are generating consistent monthly profit, a registered business structure typically reduces your net tax bill through deductible expenses and may be legally required.",
      },
      {
        q: "How do I calculate profit from Vinted sales for tax?",
        a: "Profit = sale price × 0.95 (after ~5% Vinted deduction) − cost of goods − shipping materials. Declare this net figure, not the gross sale price. Keep a record of every purchase with its buy price and source — this is your cost-of-goods evidence if the tax authority queries a year's returns.",
      },
      {
        q: "What expenses can I deduct as a Vinted reseller?",
        a: "If registered as a business or sole trader, typical deductible expenses include: purchase price of resold items, packaging and shipping materials, mileage to sourcing locations (charity shops, car boots), subscription tools used for the business (like Resale IQ), a proportion of your phone bill if used for the business. An accountant in your country can confirm which expenses apply to your structure.",
      },
    ],
  },
]
