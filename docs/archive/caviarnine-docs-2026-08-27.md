# CaviarNine documentation — archived copy

> **Archived on 2026-08-27** from https://docs.caviarnine.com (the site's `llms-full.txt` export, plus the images it references).
> Images could not be archived (the docs host returns 404 for them); text is complete. This is CaviarNine's own documentation, © CaviarNine Limited, preserved here unmodified for the users of their contracts after the
> company announced it is leaving Radix and its websites may disappear. NotCaviarNine is not affiliated with CaviarNine.
> Where this archive and the ledger disagree, the ledger wins — see the protocol specs in `docs/` for verified, current behaviour.
> Some addresses below are the ones published by CaviarNine; the ones this frontend uses are in `lib/radix/config.ts`.

## Table of contents (sitemap as archived)

## CaviarNine - The Future of DeFi

- [Welcome to CaviarNine](https://docs.caviarnine.com/welcome-to-caviarnine.md)
- [Overview](https://docs.caviarnine.com/introduction/overview.md): A brief overview of CaviarNine
- [Vision & Mission](https://docs.caviarnine.com/introduction/vision-and-mission.md)
- [Team](https://docs.caviarnine.com/introduction/team.md): more coming soon...
- [FAQ](https://docs.caviarnine.com/introduction/faq.md): Any unanswered questions please ask on TG and we'll
- [DISCLAIMER](https://docs.caviarnine.com/introduction/disclaimer.md): IMPORTANT INFORMATION
- [Terms and Conditions](https://docs.caviarnine.com/introduction/terms-and-conditions.md): IMPORTANT INFORMATION
- [TradingView Advanced Charts](https://docs.caviarnine.com/introduction/tradingview-advanced-charts.md)
- [Order Book](https://docs.caviarnine.com/audits/order-book.md): A bleeding edge Order Book that gets cheaper as more orders are placed!
- [Shape Liquidity](https://docs.caviarnine.com/audits/shape-liquidity.md): Concentrated DEX with a perfect score
- [LSU Pool](https://docs.caviarnine.com/audits/lsu-pool.md): Protect your Staked XRD with a full report from Sec3 audit
- [Overview](https://docs.caviarnine.com/tokens/overview.md): At CaviarNine we have big aspirations that's why we have several tokens!
- [FLOOP](https://docs.caviarnine.com/tokens/floop.md): Our first token, vital to our trading ecosystem
- [CAVIAR](https://docs.caviarnine.com/tokens/caviar.md): CAVIAR is designed for the next generation complex products like structured derivatives, decentralised funds, options and yield derivatives etc
- [RADIT](https://docs.caviarnine.com/tokens/radit.md): Radit was the popular investable message board built on the Olympia version of Radix (before smart contracts). There are no current plans to bring it back for Babylon.
- [Aggregator](https://docs.caviarnine.com/products-floop/aggregator.md): Always the best trade on Radix
- [Aggregator Fees](https://docs.caviarnine.com/products-floop/aggregator/aggregator-fees.md)
- [Anthic-Intent](https://docs.caviarnine.com/products-floop/aggregator/anthic-intent.md)
- [Order Book](https://docs.caviarnine.com/products-floop/order-book.md): Seize every trading opportunity
- [Overview](https://docs.caviarnine.com/products-floop/order-book/overview.md): A quick tour of the order book
- [Placing a Limit Order](https://docs.caviarnine.com/products-floop/order-book/placing-a-limit-order.md): Precise and efficient
- [Order Management](https://docs.caviarnine.com/products-floop/order-book/order-management.md): Track, Claim and Cancel Orders
- [Order Book Fees](https://docs.caviarnine.com/products-floop/order-book/order-book-fees.md)
- [Manifests](https://docs.caviarnine.com/products-floop/order-book/manifests.md): Below are the manifest for the Order Book
- [Shape Liquidity](https://docs.caviarnine.com/products-floop/shape-liquidity.md)
- [Overview](https://docs.caviarnine.com/products-floop/shape-liquidity/overview.md): Focus your capital within a particular price range and shape!
- [Bins](https://docs.caviarnine.com/products-floop/shape-liquidity/bins.md): These are the containers that hold all the tokens in the AMM for this pair!
- [Pools](https://docs.caviarnine.com/products-floop/shape-liquidity/pools.md): Explore the pool page specifics
- [Adding Liquidity](https://docs.caviarnine.com/products-floop/shape-liquidity/adding-liquidity.md): Choose exactly where to place your liquidity
- [Your Liquidity](https://docs.caviarnine.com/products-floop/shape-liquidity/your-liquidity.md): See how your liquidity is performing
- [Removing Liquidity](https://docs.caviarnine.com/products-floop/shape-liquidity/removing-liquidity.md)
- [Understanding Active APY](https://docs.caviarnine.com/products-floop/shape-liquidity/understanding-active-apy.md): To get the best yield, make sure your tokens are active!
- [How to Create a Pool](https://docs.caviarnine.com/products-floop/shape-liquidity/how-to-create-a-pool.md): Create a new pool for a pair and concentrate your liquidity
- [Starting Mid Price](https://docs.caviarnine.com/products-floop/shape-liquidity/starting-mid-price.md): When you initialise or start a new shape liquidity pool, it needs a starting price!
- [Shape Liquidity Fees](https://docs.caviarnine.com/products-floop/shape-liquidity/shape-liquidity-fees.md)
- [LSU Pool](https://docs.caviarnine.com/products-floop/lsu-pool.md): Unlock the power of staking with the CaviarNine LSU Pool. Actively grow your LSUs, swap validators instantly and unstake with ease!
- [FAQs](https://docs.caviarnine.com/products-floop/lsu-pool/faqs.md): Common LSU Pool Questions
- [Liquid Staking on Radix](https://docs.caviarnine.com/products-floop/lsu-pool/liquid-staking-on-radix.md): Put your validator stake to work
- [LSU Pool Overview](https://docs.caviarnine.com/products-floop/lsu-pool/lsu-pool-overview.md): Put your liquid staking resources to work
- [Move Stake and Instant Unstake](https://docs.caviarnine.com/products-floop/lsu-pool/move-stake-and-instant-unstake.md): Perform validator actions now, not in 1 week
- [Adding Liquidity](https://docs.caviarnine.com/products-floop/lsu-pool/adding-liquidity.md): Join the LSU Pool
- [Removing Liquidity](https://docs.caviarnine.com/products-floop/lsu-pool/removing-liquidity.md): Taking back your LSUs
- [Credit Receipt](https://docs.caviarnine.com/products-floop/lsu-pool/credit-receipt.md): This page is still under construction....
- [Manifests](https://docs.caviarnine.com/products-floop/lsu-pool/manifests.md): Below are the manifest for the LSU Pool
- [LSU Pool Fees](https://docs.caviarnine.com/products-floop/lsu-pool/lsu-pool-fees.md): LSU Pool Fee Structure
- [Simple Pools](https://docs.caviarnine.com/products-floop/simple-pools.md)
- [Overview](https://docs.caviarnine.com/products-floop/simple-pools/overview.md)
- [Create a Pool](https://docs.caviarnine.com/products-floop/simple-pools/create-a-pool.md)
- [FEES](https://docs.caviarnine.com/products-floop/fees.md): Fee information per product
- [HyperStake](https://docs.caviarnine.com/products-caviar/hyperstake.md): HyperStake's self-adjusting LSULP/ XRD pool delivers high rewards with zero upkeep, earning fees from instant unstakers and 7-day depositors.
- [CAVIAR Airdrop](https://docs.caviarnine.com/ecosystem/caviar-airdrop.md)
- [Radix Ignition](https://docs.caviarnine.com/ecosystem/radix-ignition.md)
- [Token Bridge](https://docs.caviarnine.com/ecosystem/token-bridge.md): Update your FLOOP and CAVIAR for Babylon
- [Fee Vaults](https://docs.caviarnine.com/ecosystem/fee-vaults.md): Are components where the protocol fees are collected from the FLOOP and (future) CAVIAR product ecosystems
- [Overview](https://docs.caviarnine.com/instant-xrd-unstaking/overview.md): Please note this page is under construction! (It's NOT finished yet!)
- [API](https://docs.caviarnine.com/api.md): API details are under construction
- [CoinMarketCap](https://docs.caviarnine.com/api/coinmarketcap.md): Api for CoinMarketCap
- [CoinGecko](https://docs.caviarnine.com/api/coingecko.md): Api for CoinGecko
- [Public](https://docs.caviarnine.com/api/public.md): A set of apis for public use
- [iFrame Trading Widget](https://docs.caviarnine.com/tools/iframe-trading-widget.md): Integrate our stylish trading widget into your website with the simple code snippet below


---

# Welcome to CaviarNine

<div data-full-width="true"><figure><img src="/files/aGWDxXoW0UQEq4vbDBCw" alt="" width="563"><figcaption></figcaption></figure></div>


# Overview

A brief overview of CaviarNine

**CaviarNine** is a forward-thinking fintech company focused on providing web3 users with advanced and user-friendly DeFi trading products built on the Radix platform. The company leverages its team's extensive experience in traditional finance to create modern, professional, and secure crypto products that comply with regulatory requirements. By utilising the unique features of the Radix ecosystem, CaviarNine aims to revolutionise the DeFi space and empower users with cutting-edge financial solutions.

The company's diverse team is spread across Thailand, Singapore, Canada and Australia, with its headquarters in Bangkok. Co-founders Oliver Scott-Simons and Chris Colman bring their vast experience in FX derivatives trading at top-tier investment banks to the table. With a strong commitment to innovation and a clear vision for the future, CaviarNine is set to become a major player in the world of decentralised finance.


# Vision & Mission

**Vision**: *To unlock the full potential of Decentralised Finance*\
**Mission:** *To provide users with seamless access to professional-grade innovative DeFi products*


# Team

more coming soon...

The company's diverse team is spread across Thailand, Singapore, Canada and Australia, with its headquarters in **Bangkok**. \
\
As of October 2023 we have 2 Scrypto programmers, 3 front end UI/UX, 2 designers, 2 back-end programmers + ChatGPT 😁

### Founders History

Meet **Oliver Scott Simons** (aka Tronn) and **Chris Colman**, the founders of the DeFi (Decentralised Finance) ecosystem CaviarNine. Their mission is to provide users with seamless access to professional-grade innovative DeFi products and unlock the full potential of DeFi.

Oliver holds a degree and Masters in Mathematics from Imperial College London and has had a successful 14-year career in top Tier 1 banks, trading and running derivatives and exotic derivatives trading desks. His passion for innovation, optimal hedging strategies and electronic systems led him to build a private algorithmic trading business with Chris, called Invariance.

In 2015, frustrated with the lack of innovation and restrictions on personal trading in the banking industry, Oliver left to pursue his passion for building things and innovating finance and tech. He spent the following years studying and consulting for banks, eventually building a small financial services startup that still runs today.

Chris, on the other hand, spent nearly 8 years at Cambridge University, where he did a degree in Physics and Theoretical Physics, followed by a graduate course in Computer Science and then a PhD in Physics. He started his career trading currency derivatives and eventually moved to Singapore, where he ran several global trading businesses for Barclays Investment Bank as a Managing Director.

Although banking was financially very rewarding, Chris missed the earlier days in his career when he was building trading models and actively trading and craved doing something entrepreneurial.

He subsequently left banking a couple of years after Oliver and followed a similar path of taking courses in Deep Learning, building quantitative trading models, and trading cryptocurrency. From 2019, Chris has been involved in a boutique asset management firm that he and a few former colleagues set up in Singapore - Vantage Point Asset Management.

The founders first worked together in 2005, and after spending many years working in top tier financial institutions, they realised they made a good team. Their passions for finance and technology led them to build their DeFi startup. For Oliver and Chris, DeFi is an inevitability that will eventually reach everyone, just like the internet now plays a huge role in all our lives wherever we live.

They strongly believe that DeFi is the natural next step for finance, and for individuals to get involved in. Traditional financial products are often opaque or not accessible to the masses, and Web3 has the potential to democratise these products.


# FAQ

Any unanswered questions please ask on TG and we'll

<details>

<summary>Why do you have two tokens?</summary>

In short; because we have big plans.\
\
The FLOOP ecosystem, comprising of multiple DEXes, Orderbooks, liquid staking pools and even the Aggregator are the building blocks that we (and the Radix ecosystem) need to build more complex products.\
\
CAVIAR is designed for the next generation complex products like structured derivatives, decentralised funds, options and yield derivatives etc

</details>


# DISCLAIMER

IMPORTANT INFORMATION

**CaviarNine Limited BVI**

A company incorporated in the British Virgin Islands that owns the CaviarNine ecosystem, including the team wallets holding the ecosystem tokens FLOOP and CAVIAR. CaviarNine Limited BVI is the primary entity with which users are transacting and interacting when using CaviarNine.com and its associated services.

**Caviar Labs**

A Singapore registered software development house contracted by CaviarNine Limited BVI for the creation of the CaviarNine.com website, the Aggregator, smart contract functionalities, associated liquidity provisioning tools, and various other web2 and web3 applications.

**Caviar Team**

A group of individuals in charge of the development of the CaviarNine ecosystem, encompassing but not limited to Radix L1 decentralised applications, smart contracts, and the tokens FLOOP and CAVIAR.

**IMPORTANT DISCLAIMER:**

Before using any services or applications on CaviarNine.com, including The Aggregator, smart contracts, and liquidity provisioning tools, you must carefully read and understand the following terms and conditions:

CaviarNine services and its associated features, including smart contracts, are provided "as is". While some smart contracts have undergone external audits, an audit does not guarantee that unforeseen issues won't arise in the future. By using CaviarNine products, you acknowledge and understand that the utilization of the website, software, smart contracts, and all associated services is wholly at your discretion and risk.

Any potential loss, damages, or liability arising from the use of CaviarNine products, including those related to smart contracts, is entirely the user's responsibility. Neither CaviarNine, Caviar Labs, nor the Caviar Team assumes liability for any such loss, damages, or liability, whether direct or consequential, arising from your engagement with CaviarNine.com.

CaviarNine, Caviar Labs, and the Caviar Team are not responsible for the actions or liabilities of third parties, including but not limited to Radix L1, any external DEXs, or associated smart contract interactions. Any losses or liabilities stemming from third-party actions or contract executions are the sole responsibility of the user.

The Caviar Team earnestly advises users to engage with CaviarNine.com using only assets they can afford to risk, and to exercise prudence and due diligence when navigating the website, associated software, and smart contracts.

CaviarNine, Caviar Labs, and the Caviar Team provide no guarantee regarding the accuracy, timeliness, suitability, or completeness of any information on this site and shall not be accountable for errors, delays, or inadequacies in this information or any consequences resulting from its display or use. Any links to third-party sites are purely informational; we neither control nor endorse such sites and bear no responsibility for the content's accuracy therein.

Any potential losses, including but not limited to the loss of tokens, data, or profits arising from CaviarNine.com, including smart contract engagements, lie squarely with the user.

Users should be aware that engaging with CaviarNine.com, including its smart contracts and associated financial services, may be subject to specific legal or regulatory constraints depending on their jurisdiction. In particular, residents or citizens of the United States should exercise extra caution due to regulatory uncertainties.

It is the user's obligation to familiarise themselves with and strictly abide by all relevant local, state, national, and international laws, regulations, and policies pertaining to their specific use of CaviarNine.com. If you are uncertain about the legal status of any activity or transaction, we strongly advise consulting with legal counsel in your jurisdiction before using our platform.

By using CaviarNine.com, you consent to indemnify, defend, and exempt the CaviarNine team and its affiliates from any claims, damages, losses, or expenses (including attorney fees) resulting from your usage of the website, software, or smart contracts.

Your use of CaviarNine.com signifies your understanding and acceptance of this disclaimer and all its terms and conditions.

Be advised that these terms and conditions may undergo periodic revisions, with the updated version consistently available on CaviarNine.com. Users are tasked with reviewing the current terms regularly to remain updated on any alterations.


# Terms and Conditions

IMPORTANT INFORMATION

**Terms & Conditions for CaviarNine.com**

**1. DEFINITIONS AND CONTEXT**

**CaviarNine Limited BVI:** A company incorporated in the British Virgin Islands that owns the CaviarNine ecosystem, including the team wallets holding the ecosystem tokens FLOOP and CAVIAR. CaviarNine Limited BVI is the primary entity with which users are transacting and interacting when using CaviarNine.com and its associated services.

**Caviar Labs:** A Singapore registered software development house contracted by CaviarNine Limited BVI for the creation of the CaviarNine.com website, the Aggregator, smart contract functionalities, associated liquidity provisioning tools, and various other web2 and web3 applications.

**Caviar Team:** A group of individuals in charge of the development of the CaviarNine ecosystem, encompassing but not limited to Radix L1 decentralised applications, smart contracts, and the tokens FLOOP and CAVIAR.

**2. IMPORTANT INFORMATION**

**Introduction:** By using CaviarNine.com and its associated features, you agree to abide by these Terms & Conditions (T\&Cs). Please read them carefully. If you do not agree to these terms, you should not use CaviarNine.com.

**3. SERVICES**

CaviarNine Limited BVI owns the CaviarNine ecosystem. CaviarNine.com offers various services, including The Aggregator and liquidity provisioning tools. The website and its functionality, including smart contract capabilities, were developed by Caviar Labs, a software development house.

**4. LIMITATION OF LIABILITY**

* While some smart contracts on CaviarNine.com have undergone external audits, it's vital to understand that audits don't guarantee the absence of unforeseen issues in the future.
* Users are solely responsible for any potential loss, damages, or liability arising from the use of CaviarNine products. Neither CaviarNine Limited BVI, Caviar Labs, nor the Caviar Team will be held liable for any losses, whether direct or consequential, stemming from the use of the website and its services.

**5. THIRD-PARTY INTERACTIONS**

Users acknowledge that CaviarNine Limited BVI, Caviar Labs, and the Caviar Team are not liable for actions or liabilities of third parties, including Radix L1, external DEXs, or associated smart contract interactions.

**6. USER RESPONSIBILITIES**

* Users should only engage with CaviarNine.com using assets they're willing to risk.
* Users must abide by all relevant local, state, national, and international laws and regulations. This includes, but is not limited to, regulatory requirements and constraints based on the user's jurisdiction.

**7. INDEMNIFICATION**

By using CaviarNine.com, users agree to indemnify and hold harmless CaviarNine Limited BVI, the Caviar Team, and its affiliates from any claims, damages, or losses arising from their use of the platform.

**8. INTELLECTUAL PROPERTY**

All content on CaviarNine.com, including but not limited to text, graphics, logos, and software, is the property of CaviarNine Limited BVI and is protected by international copyright laws.

**9. CHANGES TO T\&Cs**

These T\&Cs may be updated periodically. The latest version will always be available on CaviarNine.com. It's the responsibility of the users to check these terms regularly for any changes.

**10. GOVERNING LAW**

These terms are governed by the laws of the British Virgin Islands. Any disputes arising out of or in connection with CaviarNine.com will be subject to the exclusive jurisdiction of the courts of the British Virgin Islands.

**11. CONTACT**

For any questions regarding these T\&Cs, please contact CaviarNine.

## API Terms and Conditions

**1. Acceptance of API Terms**: By accessing or using the CaviarNine API, you agree to comply with these API Terms & Conditions, in addition to the general Terms & Conditions of CaviarNine.com.

**2. Permitted Use**: The CaviarNine API is designed for specific, fair use within our platform. Any use of the API for purposes not explicitly authorized by CaviarNine is strictly prohibited.

**3. Prohibited Activities**:

* **Automated Bots and Unauthorized Purposes**: Using the API for automated bots or purposes not approved by CaviarNine is forbidden.
* **Exceeding Usage Limits**: Users must adhere to the prescribed usage limits of the API. Attempts to exploit the system, including exceeding usage limits, are strictly prohibited.

**4. Future Developments**: CaviarNine is developing a dedicated Aggregator API for bot usage. This API will come with its own set of guidelines and usage terms.

**5. Compliance and Enforcement**:

* **Monitoring**: CaviarNine reserves the right to monitor API usage to ensure compliance with these terms.
* **Consequences of Non-Compliance**: Violation of these terms may result in temporary or permanent suspension of API access, legal action, or other penalties.

**6. Liability and Indemnification**: The user assumes full responsibility for any consequences arising from their use of the CaviarNine API. Users agree to indemnify and hold harmless CaviarNine from any claims, damages, losses, or expenses related to their use of the API.

**7. Changes to API Terms**: CaviarNine reserves the right to modify these API Terms & Conditions at any time. Users are encouraged to review these terms regularly. Continued use of the API after any such changes constitutes your acceptance of the new terms.<br>


# TradingView Advanced Charts

At CaviarNine, we’ve offered **TradingView Advanced Charts** for years because we believe serious charting should be fast, familiar, and packed with the tools traders actually use.

TradingView’s advanced charting experience helps you analyze price action with rich timeframes, indicators, drawing tools, and responsive performance — whether you’re doing a quick check on the market or digging into a deeper technical view. It’s a powerful way to monitor moves, validate ideas, and keep context on key levels.

Caviarnine features powerful TradingView charts to provide the latest cryptocurrency pricing and data. Enhance your analysis with the TradingView platform — access detailed [**ETH USD chart**](https://www.tradingview.com/symbols/ETHUSD/), monitor crypto trends, and use robust tools to interpret price dynamics — all in one place

Explore the charts here: <https://www.caviarnine.com/charts>


# Order Book

A bleeding edge Order Book that gets cheaper as more orders are placed!

<https://github.com/sec3-service/reports>


# Shape Liquidity

Concentrated DEX with a perfect score

Hacken Audit 10/10\
<https://hacken.io/audits/caviarnine/>


# LSU Pool

Protect your Staked XRD with a full report from Sec3 audit

<https://github.com/sec3-service/reports>


# Overview

At CaviarNine we have big aspirations that's why we have several tokens!

Our **FLOOP** and **CAVIAR** tokens are associated with our different DeFi products and serve as utility and DAO tokens for them as follows.

{% hint style="info" %}
All simple trading products are part of the FLOOP ecosystem
{% endhint %}

The **FLOOP** token:

* Aggregator
* LSU Pools
* Limit Orders
* Shape Liquidity
* Simple Pools

{% hint style="info" %}
The more complex products are part of the CAVIAR ecosystem, e.g. oracle based trading products, derivatives, trackers etc.
{% endhint %}

The **CAVIAR** token:

* HyperStake

## The CaviarNine Bridge:

FLOOP and CAVIAR were minted prior to the Babylon upgrade and the start of dApps on Radix. Holders of such legacy tokens are able to bridge them 1:1 to the Babylon versions that power our products.

The FLOOP and CAVIAR (one-way) bridges are hosted at caviarnine.com. The new Babylon FLOOP and CAVIAR tokens have two key differences:

* They are burnable (by anyone)
* We can update the metadata like name and description (if needed)

As per usual their supply remains unchanged and the are NOT mintable. The bridge mints the entire supply on initialisation and allows old for new forever.

<figure><img src="/files/Kd4948moZtKDDEWgpYND" alt=""><figcaption><p>One-way bridge for CAVIAR and FLOOP to the new burnable Babylon versions</p></figcaption></figure>

## Do I have to bridge CAVIAR or FLOOP?

Nope! You certainly don't have to at all. In fact some people might want to keep the legacy tokens as collector items though they will not have any future utility like their Babylon equivalents.


# FLOOP

Our first token, vital to our trading ecosystem

<figure><img src="/files/ch8M6bXi4EAckPfTZZeI" alt=""><figcaption><p>The FLOOP Babylon Logo</p></figcaption></figure>

## Resource Address

`resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9`

[explorer link](https://dashboard.radixdlt.com/resource/resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9)

## Products

FLOOP powers the following products:

* Aggregator
* Limit Orders
* Shape Liquidity
* LSU Pool

## Tokenomics and features

* Like the legacy mainnet token, the Babylon FLOOP has a fixed (unmutable) supply of 1000 Tokens
* Unlike the legacy version, new Babylon FLOOP is *burnable* which cannot be changed
* You can bridge the legacy FLOOP for Babylon FLOOP for a 1-to-1 basis. This is one way only!
* We expect that Babylon FLOOP will become a DAO which will be able to vote on various activities within the ecosystem

## FLOOP Utility - Key points

* Protocol Fees: All protocol fees generated from the aforementioned products are directly transferred from the smart contracts to the FLOOP fee vaults in an atomic manner.
* Fee Management: Currently, the fees are entirely used to burn FLOOP, thereby reducing its supply to zero. The fee vaults are configured to burn 100% of the FLOOP.
* Future Outlook: In the future, as the fees increase significantly and/or the FLOOP supply diminishes substantially and once it is deemed regulatory safe, the fee vaults may transition from burning to earning. At that point, FLOOP staking will be enabled and stakers will have the opportunity to claim the fees directly, transforming FLOOP into a yield-bearing token.

## Distribution of FLOOP

Most of the FLOOP tokens have been airdropped in 2021. Here is a breakdown of the past and future FLOOP tokens

<figure><img src="/files/Rd9H9yUUG7sMT3mHn2Pc" alt=""><figcaption><p>Current and Expected FLOOP distribution </p></figcaption></figure>

## Core Team Tokens

The team is allocated 20% of the FLOOP supply which is vested over 20 months for senior Developers and over 50 months for the two Founders. The team is committed to bridging the 20% soon after Babylon and locking the tokens up with a RadLock smart contract to the appropriate vesting schedules if the product exists.

## Company Reserves

The company will use these tokens for the purposes such as fund raising, marketing and legal fees. They will mostly be locked over a 50 months vesting schedule.

## Bridging

It's very easy to *bridge* your old legacy FLOOP tokens one-way into the new **Babylon FLOOP** on a one-for-one basis on [caviarnine.com](https://cavairnine.com)

## FLOOP Treasury / FLOOP Burn

In our trading ecosystem, fixed fees are directed towards the **FLOOP Treasury** smart contract.

Here’s the interesting part: a certain percentage of the FLOOP Treasury fees are converted into FLOOP and may be subsequently *burned*, thereby reducing the overall supply of FLOOP over time.

The remaining portion are secured in the **FLOOP Reserve** vault, earmarked for potential future use cases such as offering long term LP rewards, collateral or insurance against smart contract risk, or possible future distribution to FLOOP holders.

Currently (as of December 2024) 100% of all fees collected are used to burn FLOOP resulting in 10 FLOOP being destroyed and the total supply being reduced to 990 in approximately 1 year of trading on CaviarNine.

The operation of the conversion and burn mechanism is [described here](/ecosystem/fee-vaults).

## FLOOP DAO

The FLOOP DAO is central to our vision for a decentralised and community-driven ecosystem. It is the heart of our governance system where Babylon FLOOP token holders can vote on various aspects of the ecosystem, including but not limited to:

* Control over the keys to the FLOOP reserves.
* Control over whitelist and blacklist provisions.
* Influence over fee structures within the ecosystem.
* Determination of the burn rate (if any) of FLOOP tokens.
* Control over rewards for long term LPs.
* Any future governance roles that may be introduced.

With the Babylon upgrade, our focus is on maximising the utility and functionality of the FLOOP token within our ecosystem. Babylon FLOOP is an integral part of our suite of DeFi products, powering transactions and enabling key platform features.

In essence, Babylon FLOOP tokens serve as the backbone of our DAO, enabling decentralised decision-making that shapes the trajectory of our ecosystem. More details on the DAO will be forthcoming.<br>

## Future Airdrops or Incentive Programs

Currently, there are no plans for future airdrops or incentive programs. The company reserves are allocated for purposes such as fundraising, marketing, legal and exchange listing fees. While we remain open to the possibility of incentive programs, they may only be considered in the distant future as part of our ongoing commitment to the community and ecosystem development.


# CAVIAR

CAVIAR is designed for the next generation complex products like structured derivatives, decentralised funds, options and yield derivatives etc

`resource_rdx1tkk83magp3gjyxrpskfsqwkg4g949rmcjee4tu2xmw93ltw2cz94sq`

[`explorer link`](https://dashboard.radixdlt.com/resource/resource_rdx1tkk83magp3gjyxrpskfsqwkg4g949rmcjee4tu2xmw93ltw2cz94sq)

<figure><img src="/files/HTm7T97a2iWo29vSzmxw" alt=""><figcaption></figcaption></figure>

## Products

CAVIAR powers the following products:

* HyperStake - A very concentrated LSULP/XRD pool that self-adjusts using on chain oracle data.

### Tokenomics and features <a href="#tokenomics-and-features" id="tokenomics-and-features"></a>

* Like the legacy mainnet token, the Babylon CAVIAR has a fixed (unmutable) supply of 1BIO Tokens
* Unlike the legacy version, new Babylon CAVIAR is *burnable* which cannot be changed
* You can bridge the legacy CAVIAR for Babylon CAVIAR for a 1-to-1 basis. This is one way only!
* CAVIAR was burned in the one off Surge airdrop waves program, reducing it's supply significantly to approximately 904M

### CAVIAR Utility - Key points <a href="#floop-utility-key-points" id="floop-utility-key-points"></a>

* Protocol Fees: All protocol fees generated from the aforementioned products are directly transferred from the smart contracts to the CAVIAR fee vaults in an atomic manner.
* Fee Management: Currently, the fees are entirely used to burn CAVIAR, thereby reducing its supply to zero. The fee vaults are configured to burn 100% of the CAVIAR.
* Future Outlook: In the future, as the fees increase significantly and/or the CAVIAR supply diminishes substantially and once it is deemed regulatory safe, the fee vaults may transition from burning to earning. At that point, CAVIAR staking will be enabled and stakers will have the opportunity to claim the fees directly, transforming CAVIAR into a yield-bearing token.


# RADIT

Radit was the popular investable message board built on the Olympia version of Radix (before smart contracts). There are no current plans to bring it back for Babylon.

<figure><img src="/files/ZZb2edg13IL5Z55wNTwN" alt=""><figcaption><p>radit.io</p></figcaption></figure>


# Aggregator

Always the best trade on Radix

The Aggregator is at the heart of our trading platform, effortlessly finding the best price across all liquidity sources on Radix.

<figure><img src="/files/9j79sLCXh2jdwzeOgUqz" alt="" width="563"><figcaption><p>It may look like a simple token swapper but it is far more than that!</p></figcaption></figure>

## What is an Aggregator?

As DeFi ecosystems evolve, so there are more and more trading platforms and sources of *liquidity* (trades). We say that liquidity becomes *fragmented*.

The CaviarNine aggregator is a deceptively simple front end that looks like a basic token swapper, but which is actually searching all known DeFi smart contracts for liquidity. The net result is that any trade you do may be routed to multiple DEXs simultaneously in different tranches, returning the best overall execution and least *slippage*.

## Which DEXs does it connect to?

Actually the Aggregator connects to more than just DEXs. It also connects to token bridges, validators and more.&#x20;

The design of the CaviarNine aggregator is such that it automatically discovers and analyses new smart contract components as they are instantiated on the Radix ledger. This means it is always discovering new pockets of liquidity. Case in point : CaviarNine users could swap their tokens on Radix Planet even before it had a front end!

CaviarNine liquidity sources are not chosen preferentially ; they have to compete on execution with external liquidity. The only difference is that there is zero routing fee for CaviarNine liquidity.

## How to use it?

It's designed to be seamless and intuitive. Literally select the desired tokens to convert between from the pulldown, enter your amount to swap and watch it calculate the expected return tokens.

Use the Adjustment widget to set the maximum amount of slippage.

{% hint style="info" %}
Note: Ensure the minimum token return by setting the maximum slippage. Slippage might arise from factors such as a large trade occurring on a DEX between your price quote and when your trade is submitted.
{% endhint %}

## Safety

Note there are many tokens on the network including attempted scam tokens with identical names to popular tokens.&#x20;

Anywhere there is a token icon on site, you can click on it to reveal the token metadata and resource address for authenticity. For extra safety, you can directly type in the token resource address in the search bar.

You can choose to highlight your favourite tokens so they appear at the top of the list.

Official CaviarNine tokens have a gold checkmark against them.

<figure><img src="/files/NFQMNeHYNoFGRESzDnW4" alt="" width="375"><figcaption><p>Click a token icon anywhere to reveal metadata</p></figcaption></figure>

## Fees

See next section

## Routing algorithm

Well, that would be revealing the secret sauce!&#x20;

In it's current form, the aggregator considers all direct routes (Token A > Token B) and also intermediate routes via XRD (Token A > XRD > Token B). A future version will consider all intermediate routes (Token A > Token C > Token A) as and when liquidity dictates.

It also uses a novel algorithm to identify and manage all liquidity smart contracts on the Radix ledger.


# Aggregator Fees

## Aggregator Fees

Currently the aggregator charges no fees, where previously it charged 0.09%. Potentially if the aggregator gets enough traction we will look to add a fee back again.

Any aggregator fee is sent directly to the [FLOOP Treasury](/tokens/floop).


# Anthic-Intent

More details coming soon...


# Order Book

Seize every trading opportunity

The CaviarNine limit order book marries precise trading with unmatched scalability and efficiency.

The Order Book is `FREE` for Price Makers and a mere `0.03%` for Price Takers.

The following section gives an overview of the limit order book.

Also see our [Medium post](https://blog.caviarnine.com/product-preview-order-book-1963acc3d5c6).


# Overview

A quick tour of the order book

The Order Book view can be easily accessed via the menu (Trade > Limit) or by clicking the word 'Limit' on the Swap tab.

<figure><img src="/files/1XxpEaHITSsR4fuCnB0x" alt=""><figcaption><p>Order Book can be accessed via Trade > Limit (here for XRD / XUSDC)</p></figcaption></figure>

The bottom right panel shows the active order book and recent trades for the pair of tokens selected in the panel.

#### Order Book

Lists the active orders in the selected pair.

The last traded price is shown in the middle in white, surrounded by offers (above in red) and bids (below in green).

The user's active orders have a solid circle against them.

#### Recent Trades

Recent trades are listed chronologically.

Amounts are annotated in green (for buys) or red (for sells).

<div><figure><img src="/files/pbaJqmJge9Q5RqrMLdML" alt=""><figcaption><p>Active Order Book</p></figcaption></figure> <figure><img src="/files/WjvlMlfo6kX7gzzVtt1D" alt=""><figcaption><p>Recent Trades</p></figcaption></figure></div>

Note : Users have the ability to define order books in A / B or B / A convention. The default order book shown will be the most active one. Orders left in either convention will be automatically picked up by the aggregator.

<figure><img src="/files/36ekWTFa5t3VFuTokeHB" alt="" width="375"><figcaption><p>Order Book convention can be selected</p></figcaption></figure>


# Placing a Limit Order

Precise and efficient

Placing a limit order in the limit tab is straightforward:

* Select the token and amount you wish to sell
* Choose the token you wish to receive in return
* Select the rate at which to leave your order (in the market convention)

You will see the amount of tokens to receive automatically update as you change the rate.

#### Examples

* **Left** : selling 10,000 XRD for XUSDC at 0.05 XUSDC per XRD (receive 500 XUSDC)
* **Right** : selling 400 XUSDC for XRD at 0.04 XUSDC per XRD (receive 10,000 XRD)

<div><figure><img src="/files/HaFDZXkpRccW9GImHfjJ" alt=""><figcaption><p>Order to sell 10,000 XRD for 500 XUSDC (rate 0.05)</p></figcaption></figure> <figure><img src="/files/taKUwhyXmbOCRPakWvPJ" alt=""><figcaption><p>Order to buy 10,000 XRD for 400 USD (rate 0.04)</p></figcaption></figure></div>

An indicator also shows how far your order is from the middle of the market.

<figure><img src="/files/YXE3FBhqHRwBcVcLLlSa" alt="" width="375"><figcaption><p>rate and distance from mid-market</p></figcaption></figure>

Click the 'Place Limit Order' button to get a final pop-up confirm box:

<figure><img src="/files/7MGxxUpUYums25gSwTEg" alt="" width="332"><figcaption></figcaption></figure>

Once an order is confirmed and signed in the Radix wallet, you will see it appear in the Order List and Order Book.

#### Examples (from above)

* **My Orders** : showing clearly both orders entered and their progress
* **Order Book** : showing price and amount in the order book (solid circle highlight)

<figure><img src="/files/cFk2uOWNFxlbq6GYhW1g" alt=""><figcaption><p>See your orders (left) and position in order book (right)</p></figcaption></figure>

The next section details order management - tracking progress, claiming and canceling orders.


# Order Management

Track, Claim and Cancel Orders

Under construction....&#x20;

The 'My Orders' section allows for various actions to be performed.

#### Order Progress

In the below example, you can see:

* 2 **unfilled** orders in XUSDC > XRD and XRD > XUSDC
* A **partially fille**d order in XRD > XUSDC : 5,021 out of 10,000 XRD has been filled

<figure><img src="/files/dKutifyDLUTvgaMqx8yT" alt=""><figcaption><p>Order Book Management : 2 unfilled orders and 1 partially filled - see the 'Claim' button</p></figcaption></figure>

#### Claim Order

If we hover over the partially filled order, you will see a 'Claim' button appear.

Clicking this button will:

* Claim the 213.4 XUSDC earned from selling 5,021 XRD
* Cancel the remaining unfilled portion

Subsequently, the active order will disappear from the order book.

You can also click the 'Claim All Filled Orders' button to batch across all your orders.

#### Cancel Order

Canceling an order is very easy. Hovering over an order highlights a dustbin icon.

<figure><img src="/files/fjy2W690DgSAF7uai2rl" alt=""><figcaption><p>Dustbin icon appears for an unfilled order</p></figcaption></figure>

Simply click on the dustbin to cancel that order (and sign in the Radix wallet).

As for claiming, you can cancel all your active unfilled orders via 'Cancel All Unfilled Orders'


# Order Book Fees

The order book fee structure is very straightforward. Fees are sent to the [Floop Treasury](/tokens/floop#floop-treasury).

<table data-full-width="true"><thead><tr><th width="322">Action</th><th width="198">Fee</th><th>Information</th></tr></thead><tbody><tr><td>Placing an Order</td><td>free</td><td>No charge for leaving orders</td></tr><tr><td>Canceling an Order</td><td>free</td><td>No charge for cancelation</td></tr><tr><td>Claiming a (partially) filled Order</td><td>free</td><td>No charge for claiming</td></tr><tr><td>Trading on an Order</td><td><code>0.03%</code></td><td>Charged on the volume you trade</td></tr></tbody></table>

{% hint style="info" %}
The above order book fees exclude the Radix network fees (currently about 0.7 XRD)
{% endhint %}


# Manifests

Below are the manifest for the Order Book

You don't need CaviarNine to interact with any smart contract. All you need is the manifest and to submit it the Radix network. An easy way to submit is already supplied by Radix via their dashboard: <https://console.radixdlt.com/transaction-manifest>

## Price Condition Information:

Please note that any price sent to a CaviarNine Order Book can have a maximum of 5 significant figures.

```
Decimal("{PRICE}") - This must be a number with maximum 5 significant figures
```

## Place a single limit order:

Simple manifest to place a single order

```
CALL_METHOD
    Address("{ACCOUNT}")
    "withdraw"
    Address("{TOKEN}")
    Decimal("{AMOUNT}")
;
TAKE_ALL_FROM_WORKTOP
    Address("{TOKEN}")
    Bucket("tokens")
;

CALL_METHOD
    Address("{ORDER_BOOK_COMPONENT}")
    "limit_order"
    Bucket("tokens")
    Decimal("{PRICE}")
;

CALL_METHOD
    Address("{ACCOUNT}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```

## Place multiple limit orders:

Condition:

```
AMOUNT >= AMOUNT_0 + AMOUNT_1 + AMOUNT_2 ...
```

Manifest example below with 3 limits placed at the same time. The limit of the number of orders you can place at any one time is set by the Radix gas being spent:

```
CALL_METHOD
    Address("{ACCOUNT}")
    "withdraw"
    Address("{TOKEN}")
    Decimal("{AMOUNT}")
;

TAKE_FROM_WORKTOP
    Address("{TOKEN}")
    Decimal("{AMOUNT_0}")
    Bucket("tokens_0")
;
TAKE_FROM_WORKTOP
    Address("{TOKEN}")
    Decimal("{AMOUNT_1}")
    Bucket("tokens_1")
;
TAKE_FROM_WORKTOP
    Address("{TOKEN}")
    Decimal("{AMOUNT_2}")
    Bucket("tokens_2")
;

CALL_METHOD
    Address("{ORDER_BOOK_COMPONENT}")
    "limit_order_batch"
    Array<Tuple>(
        Tuple(
            Bucket("tokens_0"),
            Decimal("{PRICE_0}")
        ),
        Tuple(
            Bucket("tokens_1"),
            Decimal("{PRICE_1}")
        ),
        Tuple(
            Bucket("tokens_2"),
            Decimal("{PRICE_2}")
        ),
    )
;

CALL_METHOD
    Address("{ACCOUNT}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```

## Claim or Cancel a Single Order:

Cancelling or Claiming is an identical manifest.

* If your order has been 100% filled you will get back you filled tokens
* If your order has been partially filled, you will get back the correct amount of both tokens
* If you order has been traded on, you will get back 100% of the original tokens you put in

To claim/cancel your orders you will need:

<pre><code><strong>ORDER_BOOK_ORDER_RECEIPT - Get this from your wallet
</strong>ORDER_ID - Get this from your wallet
</code></pre>

Manifest below claiming a single order:

```
CALL_METHOD
    Address("{ACCOUNT}")
    "withdraw_non_fungibles"
    Address("{ORDER_BOOK_ORDER_RECEIPT}")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{ORDER_ID}"),
    )
;
TAKE_NON_FUNGIBLES_FROM_WORKTOP
    Address("{ORDER_BOOK_ORDER_RECEIPT}")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{ORDER_ID}"),
    )
    Bucket("order_receipts")
;

CALL_METHOD
    Address("{ORDER_BOOK_COMPONENT}")
    "claim_orders"
    Bucket("order_receipts")
;

CALL_METHOD
    Address("{ACCOUNT}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```

## Claim or Cancel Multiple Orders:

Please read above manifest also.

If you have multiple orders from the same order book component, you can cell them in one manifest:

```
CALL_METHOD
    Address("{ACCOUNT}")
    "withdraw_non_fungibles"
    Address("{ORDER_BOOK_ORDER_RECEIPT}")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{ORDER_ID_01}"),
        NonFungibleLocalId("{ORDER_ID_02}"),
        NonFungibleLocalId("{ORDER_ID_03}"),
    )
;
TAKE_NON_FUNGIBLES_FROM_WORKTOP
    Address("{ORDER_BOOK_ORDER_RECEIPT}")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{ORDER_ID_01}"),
        NonFungibleLocalId("{ORDER_ID_02}"),
        NonFungibleLocalId("{ORDER_ID_03}"),
    )
    Bucket("order_receipts")
;

CALL_METHOD
    Address("{ORDER_BOOK_COMPONENT}")
    "claim_orders"
    Bucket("order_receipts")
;

CALL_METHOD
    Address("{ACCOUNT}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```

## Execute a Market Order (trade directly with component)&#x20;

A simple manifest below. Note that the {STOP\_PRICE} is an Enum so Optional

```
CALL_METHOD
    Address("{ACCOUNT}")
    "withdraw"
    Address("{TOKEN}")
    Decimal("{AMOUNT}")
;
TAKE_ALL_FROM_WORKTOP
    Address("{TOKEN}")
    Bucket("tokens")
;

CALL_METHOD
    Address("{ORDER_BOOK_COMPONENT}")
    "market_order"
    Bucket("tokens")
    Enum<1u8>(
        Decimal("{STOP_PRICE}")
    )
;

CALL_METHOD
    Address("{ACCOUNT}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```


# Shape Liquidity


# Overview

Focus your capital within a particular price range and shape!

## What is Shape Liquidity?

The Shape Liquidity smart contract is an Automatic Market Marker (AMM) much like Uniswap, SushiSwap and PancakeSwap but a lot more powerful. Like traditional AMM's, Shape Liquidity creates a pool of *two tokens* where users can:

* **Add (and remove) token liquidity** in both or one, earning fees when the tokens are used
* **Swap** between the tokens at a price determined algorithmically<br>

## Pools list overview

In the pool list on [CaviarNine](https://www.caviarnine.com/earn/shape-liquidity) you will find all the Shape Liquidity pair pools. Here you can select a pool to add liquidity to or even create a pool if you can't find the pair you want. \
\
See below and you can see the following information in each pool:

* The Pool tokens - The two fungible tokens that are used in this pool
* Bin Size - This number represents how wide the bins are in this pool. Each unit of bin is worth 0.10% so 2 means that the bins are 0.20% wide and 10 means they are 1.00% wide. Find out more about bins in the next section
* Total Value Locked - The total amount of tokens in the pool valued in your currency of choice
* Volume 24h - Total amount traded in 24 hours in this pool in your currency
* APY - The annualised yield calculated using the past 24 hours volume and the current pool fees. Please note this is a historic number and does not reflect the future APY
* Your Liquidity - If you have added liquidity in this pool, you will see the total valuation of all your liquidity receipts (from this pool) here

<figure><img src="/files/zSgG3YxzyfemYxhUNING" alt=""><figcaption><p>Earn Shape Liquidity Page</p></figcaption></figure>

## Summary

The power in Shape Liquidity comes from the ability to concentrate your tokens!

* Concentrate your token(s) liquidity in your price range - Earn more with your tokens
* Tailor your concentration shape to suit your needs
* Small or big bins allows you to define the price granularity


# Bins

These are the containers that hold all the tokens in the AMM for this pair!

In Shape Liquidity, we use bins to divide up the price into bins that can contain tokens from the pair. When a pool is created, the bin size is fixed for that pair. Bin sizes can be as big as you like or as small as 1 which is \~0.10% wide<br>

<figure><img src="/files/QXhT5DBtoiLIc1O2R7kj" alt=""><figcaption><p>Basic bin concept</p></figcaption></figure>

## Bin Size to Percentage

We use bin size to define how wide all the bins are in the pool.&#x20;

A Bin size of 1 means each bin is roughly \~0.10% wide, Bin Size of 2 means \~0.20% wide and so on.. 10 = \~1.00% wide, bin size of 100 = \~10.00%&#x20;

## What Bin Size should I pick for my pair?

Here are some guidelines:

* Different bin sizes determine how concentrated the liquidity is in a pool.
* A good default Bin Size = 20-50 (2 - 5% wide).
* Typically bin size should mirror how volatile the pair is.
* If the price of your pair of tokens is relatively stable (low volatility) then we suggest picking a low number like 1-10. Example low volatility pairs:&#x20;
  * LSU\_A vs LSU\_B
  * XRD vs LSU
  * FLOOP\_Mainnet vs FLOOP\_Babylon  etc
* If the price of your pair of tokens moves around a lot (high volatility) then we suggest picking a larger bin size like 50-100. Examples of high volatility pairs:
  * Meme tokens
  * Highly speculative tokens or those you anticipate could move a lot

## Tokens in Bins

Imagine we have a pair **TokenA vs TokenB**

* All the bins *above* the active bin can only contain TokenA
* The bin that contains the current spot we call the *active bin.* This bin could have a mix of both tokens A and B
* All the bins *below* the active bin can only contain TokenB

Let's say the current **price** is 1 TokenA = 4.850 Token B and the **Bin Size** = 10 (so 1% wide bins)

Here's a bin diagram:

<figure><img src="/files/3hdPi1SVPg5SPtiAn0Ap" alt=""><figcaption></figcaption></figure>

## Are tokens in every bin?

Tokens are only in bins that liquidity providers have put them in! Otherwise the bins are empty and serve no purpose.\
\
Here's a real example of the liquidity bins in the CAVIAR/XRD pool which has a Bin Size = 20, which means each bin is 2.00% apart. (you can verify in the diagram!)

<div data-full-width="true"><figure><img src="/files/DADte9G6fRGoaIqjnucr" alt=""><figcaption></figcaption></figure></div>

Some things we can infer from this:

* All the Bins (or bars here) to the RIGHT of the spot price will ONLY hold CAVIAR tokens
* All the Bins to the LEFT of the spot price bin will ONLY hold XRD tokens
* Looking at the shape, liquidity providers have concentrated their tokens (XRD and CAVIAR) around \~0.2400
* Also it's quite concentrated in this pool in the 0.20 - 0.28 range then afterwards there is a lot less tokens on either side


# Pools

Explore the pool page specifics

#### Let's click into a specific pool - in this case `XRD / xUSDC`

<figure><img src="/files/vfav7AOzkP1xlM93ZWQZ" alt=""><figcaption></figcaption></figure>

There are 3 main panes that we will look at in turn:

* Charting (top left) - shows various stats associated with this pool
* Liquidity (top right) - allows you to view, add and remove liquidity
* Trades (bottom left) - self explanatory really

### Charting and Stats

Firstly, there is some info above the chart itself.

<figure><img src="/files/mBMz5J37u0P2TdyJNsUh" alt=""><figcaption></figcaption></figure>

Here we see the following:

* Pool name - as usual you can click on any token icon to see pop-up metadata
* Pool fees (which can differ by pool). The fee for this pool is `0.30%`
* Pool component address (with copy icon)
* Current Spot Price for this pool (the active liquidity)
* Bin Size (which can differ by pool). This pool has bin size of 10 (so about 1% wide bins)
* The 7 day historic volume (in your chosen currency)
* The [Active APY](/products-floop/shape-liquidity/understanding-active-apy#introduction) for this Pool

Now let's look at the charts themselves:

<div data-full-width="false"><figure><img src="/files/922FVFjilGdqRj6e9Ops" alt=""><figcaption><p>Price</p></figcaption></figure> <figure><img src="/files/j8CNTVBrQHHk0PC1C6wD" alt=""><figcaption><p>TVL</p></figcaption></figure></div>

<div data-full-width="false"><figure><img src="/files/fxARhwbnaIexwu20i2aR" alt=""><figcaption><p>Volume</p></figcaption></figure> <figure><img src="/files/iCCT2vaS1Uz7aAdqD8Ak" alt=""><figcaption><p>APY</p></figcaption></figure></div>

These charts detail:

* Price - how the price of the pair has moved over the last 10 days
* TVL - the evolution of the Total Value Locked of this pool (in your chosen currency)
* Volume - the historic volume traded in this pool in 6 hr snapshots
* APY - the timeseries of the [Active APY](/products-floop/shape-liquidity/understanding-active-apy#introduction) for this pool

Finally, we have 1 final chart to look at:

#### Liquidity Chart

<div><figure><img src="/files/DgNXEp7VwGGbCo7NM6lq" alt=""><figcaption><p>Liquidity Chart</p></figcaption></figure> <figure><img src="/files/VsONwYlci8mlh6I2Qtk4" alt=""><figcaption><p>Rescaling Your Liquidity</p></figcaption></figure></div>

The liquidity chart shows you the total liquidity in this pool. As people add liquidity (using differening numbers of bins and shapes) then so this chart shows the aggregation of all of that liquidity. Current spot is highlighted with a vertical white line for reference.

Overlayed on the chart is your liquidity in green. Click the **Scale** button to plot it on a separate axis and zoom in for easy viewing.

In the following sections we will look at liquidity management and also how to create a new pool.


# Adding Liquidity

Choose exactly where to place your liquidity

Shape Liquidity pools allow for very tailored placement of liquidity. You can choose the range, shape, amounts and even to supply just 1 token type.

The UI offers 2 methods of adding liquidity - **Simple** and **Advanced**.

<div><figure><img src="/files/Ih6H7vBXen2wo4iAFCvy" alt=""><figcaption><p>Simple mode</p></figcaption></figure> <figure><img src="/files/nF2VYay9bw7pFhn9Zvr6" alt=""><figcaption><p>Advanced mode</p></figcaption></figure></div>

### Simple mode

Simple mode offers a much simpler interface while still providing flexibility around amount of tokens staked and the range they are in.

* Token amounts - enter using the keyboard or the sliders.
* Liquidity concentration - choose from 5 presets.

<figure><img src="/files/ww7IsIXTGIzjHOwBNYHL" alt="" width="375"><figcaption><p>Choose amount and concentration</p></figcaption></figure>

#### Examples

Below are 3 examples

* Left - 50% of the user's XRD tokens and 25% of xUSDC tokens in a **Low** concentration. The minimum and maximum of the range of liquidity is shown to be `0.033737` to `0.091684`&#x20;
* Middle - 180 XRD and 40 xUSDC tokens in a **High** concentration. The minimum and maximum of the range of liquidity is shown to be `0.050325` to `0.061464`which is tighter than the Low range
* Right -  100% of the user's xUSDC tokens in a **Medium** concentration. The range is `0.043317` to `0.055616`which is **below current spot**. This makes intuitive sense - those xUSDC will be converted to XRD when spot moves lower.

<div data-full-width="true"><figure><img src="/files/hvA2JP2UKNt4qCckwUAy" alt=""><figcaption><p>Low concentration</p></figcaption></figure> <figure><img src="/files/OtbYYZvabYdp25XW5RKQ" alt=""><figcaption><p>High concentration</p></figcaption></figure> <figure><img src="/files/Xw6LU5a37CDx63S1Sqwl" alt=""><figcaption><p>Single token liquidity</p></figcaption></figure></div>

{% hint style="info" %}
You absolutely can just add 1 token liquidity to a pool. However, over time that token may trade and get converted to the other token. You are then essentially providing 2 token liquidity from that point. Just your starting point was with 1 token.
{% endhint %}

Hit the **Add Liquidity** button once you are ready and then see it appear under **Your Liquidity**.

### Advanced Mode

Advanced mode allows for finer control of your liquidity. You have control over:

* Shape - Spot (simple range), Curve (centre peaked) and Bid-Ask (dumbbell)
* Concentration - Directly choose the number of bins to determine the min/max range
* Position - Choose the Mid Price to centre or skew your liquidity (even single sided)

<figure><img src="/files/HHyd6mjSD2HUyTGwkIa6" alt="" width="375"><figcaption><p>Advanced Mode</p></figcaption></figure>

#### Examples

Below are 3 examples

* Left - This is a narrow concentrated range (2 bins, each of which are 1% wide). This shape would suit a very stable pair such as `xUSDT / xUSDC` or `LSULP / XRD`
* Middle - This is a wider range (50 bins wide so about 50% of spot). The liquidity is peaked symmetrically further away from current spot.
* Right - This narow, peaked liquidity is actually fully above current spot (we used Mid Price of 0.066). So it is single sided liquidity providing XRD only.

<div><figure><img src="/files/z3gQzLhkCIhWWpz9T9vN" alt=""><figcaption><p>Narrow and concentrated</p></figcaption></figure> <figure><img src="/files/Wp2JKfvJwO2KxO4K9KR5" alt=""><figcaption><p>Broad and peaked</p></figcaption></figure> <figure><img src="/files/QxYU4wLHRLccX0e3qZ7t" alt=""><figcaption><p>Narrow and single sided</p></figcaption></figure></div>

#### Token amounts

In the above examples, you only need to choose the amount of 1 of the tokens. The UI will autofill the amount of the other token, based off the liquidity profile you have chosen.

If your liquidity profile is not centred then the amounts of each token needed will not be the same as if they were converted at the mid rate. The extreme example is the rightmost one above - since all liquidity is above spot then you can only supply XRD tokens and no xUSDC tokens.

Hit the **Add Liquidity** button once you are ready and then see it appear under **Your Liquidity**.

We'll look at that in the next section.


# Your Liquidity

See how your liquidity is performing

#### Shape Liquidity Performance

Once you have provided liquidity, you can see how it is doing via the **Your Liquidity** tab in a Shape Liquidity Pool.

Let's pick the same XRD / xUSDC Pool from the earlier section.

<figure><img src="/files/mpIGk4NTGkTLEDJ5rGWF" alt="" width="563"><figcaption><p>Your Liquidity</p></figcaption></figure>

At the very top is your total liquidity provision in this pool valued in your chosen currency (here $2,871.80).

Below that is the breakdown of each tranche of liquidity you have provided (each on a separate card).

Let's analyse in detail each card from above.

#### Liquidity Position 1:

<figure><img src="/files/8AN2FKJfhixCiXTmxLAx" alt="" width="563"><figcaption></figcaption></figure>

#### Liquidity Position 2:

<figure><img src="/files/908clk9eD7XRa4fEXHbn" alt="" width="563"><figcaption></figcaption></figure>

#### Viewing in the Portfolio page

Your Shape Liquidity positions can also be seen summarised on the **Portfolio** page.

<figure><img src="/files/w77dVCuYHlvUUm9uYJws" alt=""><figcaption><p>Shape Liquidity summary in Portfolio page</p></figcaption></figure>


# Removing Liquidity


# Understanding Active APY

To get the best yield, make sure your tokens are active!

## Introduction

**Active APY (Annual Percentage Yield)** is a crucial metric for investors and traders in various financial markets. It provides a dynamic and focused understanding of the potential returns from active trading spots or bins over a specific period. This document aims to explain the concept of Active APY, how it is calculated and its significance in investment decisions.

### What is Active APY?

Active APY is an annualised metric that measures the yield or return on investment, specifically focusing on the most active trading ranges within the last seven days. It differs from traditional APY by concentrating on the parts of the portfolio or fund that are actively generating fees, providing a more current snapshot of investment performance.

### Understanding the Limitations of Active APY in Liquidity Provision

When providing liquidity in Shape Liquidity pools, it's important to understand that Active APY represents only a part of the overall financial picture. Active APY calculates the yield from active trading within the pool, reflecting the fees you earn. However, this metric does not account for impermanent loss, which occurs when the price of tokens in the pool changes significantly. If the token price moves drastically, the fees indicated by Active APY may not fully offset the impermanent loss experienced. Conversely, if the token price returns to its initial level at the time of your deposit, the impermanent loss is effectively nullified, leaving you with the earnings from the fees. Therefore, while Active APY is a valuable tool for assessing returns from active trading, it should be considered in conjunction with potential impermanent loss to get a complete understanding of the profitability of liquidity provision.

> **Note:** Active APY reflects trading fees earned but does not account for impermanent loss. Always consider potential price fluctuations of tokens in the pool alongside Active APY for a complete financial assessment.

### Calculation of Active APY

The calculation of Active APY involves two key components:

1. **ACTIVE\_FEES\_7D**: This represents the fees earned from active trading bins within the last 7 days.
2. **ACTIVE\_CAPITAL\_7D**: This denotes the total capital invested in these active bins during the same period.

The formula for Active APY is as follows:

$$
\text{Active APY} = \left( 1+\frac{\text{ACTIVE\_FEES\_7D}}{\text{ACTIVE\_CAPITAL\_7D}} \right)^{52} - 1
$$

This formula takes the ratio of the active fees to the active capital for a week, annualises it by raising it to the power of 52 (weeks in a year) and then subtracts 1 to express it as a yield.

### Importance of Active APY

Active APY is especially useful for:

* **Real-time Performance Analysis**: It offers a more immediate view of how actively managed segments of a portfolio are performing.
* **Investment Decision Making**: Investors can use this metric to assess the effectiveness of active trading strategies.

### Limitations

While Active APY is a valuable tool, it's important to remember:

* **Market Variability**: Returns can fluctuate and past performance is not always indicative of future results.
* **Specific Focus**: It only considers returns from active spots, not the entire investment.

### Conclusion

Active APY provides a nuanced and timely perspective on investment returns, particularly useful in active trading scenarios. By focusing on the most productive parts of an investment over a recent period, it helps investors and traders gauge the effectiveness of their strategies in near real-time.

{% hint style="info" %}
If your liquidity is far away from the active trading area then you are unlikely to be enjoying returns similar to the Active APY
{% endhint %}

{% hint style="info" %}
**Key Insight:** If the token price returns to its initial value at your liquidity adding time, impermanent loss is nullified, effectively realising the earnings indicated by Active APY from trading fees.
{% endhint %}


# How to Create a Pool

Create a new pool for a pair and concentrate your liquidity

The first thing to do is check that a pool doesn't already exists with your tokens in already. Here we search for the BOBBY token to see what pools are available...

<div data-full-width="true"><figure><img src="/files/vIjytJK6CPg8wVJmF6RH" alt=""><figcaption><p>Searching for a pool with the BOBBY token</p></figcaption></figure></div>

## Example "Create a Pool" with an LSU and XRD

coming soon

<br>


# Starting Mid Price

When you initialise or start a new shape liquidity pool, it needs a starting price!

more coming soon


# Shape Liquidity Fees

Fees are on a per-pool basis and can be seen on the pool page as shown [here](/products-floop/shape-liquidity/pools#charting-and-stats)


# LSU Pool

Unlock the power of staking with the CaviarNine LSU Pool. Actively grow your LSUs, swap validators instantly and unstake with ease!


# FAQs

Common LSU Pool Questions

Some plain English Q\&As:

<details>

<summary>What tokens are in the LSU Pool?</summary>

LSU Pool holds only LSU tokens.

It does not hold XRD or other tokens

</details>

<details>

<summary>Does the LSU Pool receive airdrop tokens?</summary>

No. See above.\
The LSU Pool only contains LSU tokens.

</details>

<details>

<summary>What is the LSULP token for?</summary>

The LSULP token represents ownership of LSU Pool

If you own 10% of LSULP token supply then you own 10% of the LSU Pool contents

</details>

<details>

<summary>The LSU Pool says APY is eg 8.5% is that in addition to validator emissions?</summary>

No. The LSU Pool APY is the TOTAL annualised return (backwards looking).

It includes:

* Validator emissions on the LSUs in the LSU Pool
* Fees earned by the LSU Pool from swapping

</details>

<details>

<summary>What does the LSULP NAV mean? Why are there 2 prices for LSULP token?</summary>

The NAV (Net Asset Value) of the LSULP token represents its value in XRD.

NAV = XRD\_value\_of\_LSU\_Pool / Supply\_of\_LSULP\_tokens

* The NAV Price is what you get from removing liquidity
* The Market Price is what you would get from selling LSULP on a DEX

</details>

<details>

<summary>Give me an example of the 2 LSULP 'Prices'</summary>

You own 1000 LSULP tokens.

The NAV Price is `1.02`. The Market Price is `1.015`

* Market Price:&#x20;
  * You SELL the LSULP tokens directly on a DEX and receive `1015 XRD`
* NAV Price:
  * You Remove Liquidity from LSU Pool
  * You receive `1020 XRD` worth of LSU tokens

</details>

<details>

<summary>What is the Credit Receipt about?</summary>

The Credit Receipt records what type of LSU you deposited in the LSU Pool.

It allows you to remove liquidity in the same LSU free of charge (if there is enough supply).

</details>

<details>

<summary>Why can't I remove my original LSU tokens?</summary>

LSU Pool contains a mixture of different LSU tokens.

It is possible that your original LSU tokens have been replaced by other LSU tokens.

If you want to remove liquidity then you may have to remove in different LSUs.

That is a feature of LSU Pool.

People swap LSUs and that generates fees for the Pool. That also means your desired LSU might not be in sufficient supply.

Whichever LSUs you choose to withdraw, they will always be in your entitled XRD amount

</details>


# Liquid Staking on Radix

Put your validator stake to work

#### The Babylon update saw Radix introduce the concept of liquid staking. Here's how it works:

* A user stakes to a validator (to help secure the network and earn emissions)
* The validator returns the user a fungible *LSU* token representing their share of the staking pool
* Each different validator issues a *unique* LSU token
* The validator staking pool (of which the LSU holder owns a share) accrues XRD rewards (network emissions) over time. Rewards are discounted for validator downtime (penalties) and validator fees.
* Currently, as there is no slashing, LSUs can only go up in value (or at worse remain constant)

So a staker to a validator on Radix holds LSU tokens which are unique to that specific validator, fungible and increase in XRD value over time.

The Radix protocol enforces a *7 day unstaking period* - the time it takes from unstaking your LSU to receiving the associated XRD stake bac&#x6B;*.*

For more comprehensive details of staking on Radix, see this [overview](https://learn.radixdlt.com/article/what-is-a-liquid-stake-unit-lsu-and-native-liquid-staking).

**Read on for how the LSU Pool works.**


# LSU Pool Overview

Put your liquid staking resources to work

## The LSU Pool

The LSU Pool provides multiple ways to put your LSU tokens to work:

* **Instantly move stake** between validators (swap one LSU for another)
* Facilitates **Instant Unstaking** from a validator
* Potential for **additional yield** to LSU Pool liquidity providers from fees earned
* Mints the **LSULP** pool ownership token

The LSU Pool is a multi-token pool that *exclusively holds LSU tokens*.

{% hint style="info" %}
The Pool does not hold XRD or any non-LSU token. Airdrops to the Pool will be rejected.
{% endhint %}

<figure><img src="/files/D6hrbwICn4G19u63snoY" alt=""><figcaption><p>LSU Pool landing page</p></figcaption></figure>

In this overview we will walk through the landing page UI.

### Liquidity Section

<div><figure><img src="/files/5tvL5XDat4j0NIxrTpxb" alt=""><figcaption><p>Manage your LSUs</p></figcaption></figure> <figure><img src="/files/gXyjlqYyOQ80cVFuDjaY" alt=""><figcaption><p>See your Pool holdings and instant liquidiation value</p></figcaption></figure></div>

The liquidity section allows you to:

* Add / Remove Liquidity to the Pool
* Swap LSUs (ie switch validators)
* See your liquidity position

Adding, removing and swapping liquidity are detailed in later sections of these docs.

Looking at **My Liquidity**, we see the following:

#### Token position (here 9,993.86)

This is the number of LSULP tokens you hold from adding liquidity to the Pool (or from buying directly on a DEX or other dApp). It represents your Pool stake.

#### NAV (7 days waiting period, here 10,084.83 XRD)

This is the value of your Pool stake. It is equivalent to: `LSULP tokens * LSULP Price`

(here `9993.86 * 1.00910224 = 10,084.83)`&#x20;

If you remove all your liquidity from the Pool, you will receive this value worth of LSUs.

You could then unstake them from your validator(s) in the usual manner.

#### Market Value (here 9,992.40 XRD)

This is the indicative value of your LSULP tokens if you were to **sell them directly for XRD via the aggregator rather than via unstaking.**

This is likely to be less than the NAV value above since it represents the **price for immediate liquidity** in your liquid staking tokens.

### Stats and Graphs

The LSU Pool page shows various information about the state of the Pool.

<div><figure><img src="/files/OOxPRfiUiKWhzvleZYpX" alt=""><figcaption><p>Pool NAV in XRD</p></figcaption></figure> <figure><img src="/files/wpePdirjg5MgRuRDpFSR" alt=""><figcaption><p>Pool TVL in $ equivalent</p></figcaption></figure></div>

<div><figure><img src="/files/3xy8yfjFdPnFhtUnBSRL" alt=""><figcaption><p>Pool 24 hr trading volume in $</p></figcaption></figure> <figure><img src="/files/jSQ72IjR0RnYre9mVIbI" alt=""><figcaption><p>Pool 7 day average historical APY</p></figcaption></figure></div>

#### Total Value Locked (TVL)

This is the current value of the Pool. It represents the total value of all the LSUs it contains. The LSUs in the pool are priced in XRD but we display the indicative $ value here for convenience.

#### Pool Price (NAV)

This represents the price in XRD per LSULP token. If you were to remove liquidity by 1 LSULP token, then you would get back an amount of LSU tokens equivalent to this XRD amount (before any fees).

This price is useful to compare directly against validator LSUs. At the time of writing these docs, the Pool price is `1.0091` whereas the *best performing validator* LSU price is `1.0085` demonstrating the outperformance of the Pool (due to fees it earns).

#### Pool Trading Volume

Shows the volume of trades ($ equivalent) in the Pool that generated fees. The text shows the total over the last 7 days, the graph shows the last 24 hours.

#### Pool APY (Annual percentage yield)

This shows the historic (backward looking) equivalent yield from staking to the Pool. It represents the growth of the Price (NAV) over the last 7 days transformed into an equivalent **annual return**.

The Pool APY includes both LSU yield (validator emissions) and fees earned by the Pool.

If there was no fee income from economic activity, the Pool APY would be similar to that of the portfolio of LSUs alone.

{% hint style="info" %}
Pool APY is a historical value and is no guarantee of future return
{% endhint %}

### Pool Liquidity Composition

<figure><img src="/files/j0cQ9fncjq8gCA0fpZ94" alt=""><figcaption><p>Breakdown of LSUs in the Pool</p></figcaption></figure>

The liquidity view further shows the breakdown of LSUs in the Pool, ranked by value.

This is useful to get an idea of the available liquidity for swapping LSUs or removing liquidity.&#x20;

#### Curation

CaviarNine (and in future the FLOOP DAO) has the ability to determine which LSUs are eligible for the Pool. Validators with very high fees or poor uptimes could have associated LSUs with low yield which could cause a drag on the returns of the Pool.&#x20;

Consequently, adding liquidity and swapping these LSU tokens is not permitted in LSU Pool. See the section on [Adding Liquidity](/products-floop/shape-liquidity/adding-liquidity) for more detail.

### LSU Pool Token

<figure><img src="/files/WaGJpeoTLaOPjLINtCpB" alt="" width="188"><figcaption><p>LSULP token</p></figcaption></figure>

Pool ownership is tokenised with the LSULP fungible utility token.

`resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf`

[explorer link](https://dashboard.radixdlt.com/resource/resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf)


# Move Stake and Instant Unstake

Perform validator actions now, not in 1 week

LSU Pool allows for instant validator actions that would normally take 1 week (since unstaking from a node takes 2016 \* 5 minute epochs)

## Move your stake between validators

With LSU Pool you can move stake between validators easily! Simply swap your LSUs for different LSUs that are already in the pool. The amount you can swap is limited by the liquidity of the new token in the pool.

### From the Validator page

Hover over your staked validators (at the top of the list) and select 'Move'.

<figure><img src="/files/70Nq18cnWyOyajf4aOGf" alt=""><figcaption><p>Hover over to get the 'Move' button</p></figcaption></figure>

You'll get a pop-up which allows you to directly switch to another eligible validator

<figure><img src="/files/X1zRvqkvHo82YjubzRox" alt="" width="375"><figcaption><p>Move stake - choose amount to move</p></figcaption></figure>

### Move calculations

In the graphic above we see:

* 1000 CaviarNine-India LSUs swapped for
* 999.33688746 RadixPool LSUs.

Each LSU has its own price in XRD. At the time of writing (shortly post Babylon) the LSU prices in XRD are, respectively, 1.00388 and 1.00384.

Calculating the XRD equivalents we get:

* 1003.88 XRD of CaviarNine-India LSUs swapped for
* 1003.17 XRD of RadixPool LSUs.

The difference in value being the `0.07%` fee as outlined below.

### Fees

Moving stake costs `0.07%` which is broken down as follows:

* `0.05% switching fee` which goes to the LSU Pool itself
* `0.01% protocol fee` which goes to the [FLOOP Treasury](/tokens/floop)
* `0.01% reserve fee` which accumulates and can be used in the future to remove bad LSUs from the pool^

^ *'bad' LSUs here could mean those with raised fees or frequent missed proposals that could otherwise drag the performance of the pool.*

## Instant Unstake

{% hint style="info" %}
A more in-depth look at Instant Unstake can be found [here](/instant-xrd-unstaking/overview)
{% endhint %}

Instant Unstake does what it suggests - switch your LSUs instantly for XRD.

It does this by:

* Adding your LSUs to the LSU Pool
* Swapping your credited LSULP tokens for XRD using the LSULP / XRD [Shape Liquidity](/products-floop/shape-liquidity) pool.

### From the Validator page

Hover over your validator and select 'Unstake'

<figure><img src="/files/YGOPPSrbiK2lwKYwM1BF" alt=""><figcaption></figcaption></figure>

You now have the choice of:

* unstaking normally (using the Radix protocol)
* unstaking Instantly

<figure><img src="/files/oblxGUfV9dL38ESzH1rb" alt="" width="375"><figcaption><p>Normal or Instant Unstake</p></figcaption></figure>

### Fees and Slippage considerations

If you unstake normally (using the Radix protocol) then:

* There will be *no charge* other than the usual Radix unstake fee
* You will receive your XRD stake back in *7 days*

If you **Instant Unstake** then:

* You will get your XRD back *instantly*
* You will pay LSULP / XRD Shape Liquidity swap *fees* of `0.20%` (currently)
* You may suffer *slippage* due to the depth of the LSULP / XRD pool

The Instant Unstake popup will show you the likely XRD you will receive after fees and slippage (in this case 986.4 XRD for 1000 LSUs unstaked).

{% hint style="info" %}
You can add a minimum guarantee XRD amount via your wallet to limit further slippage
{% endhint %}


# Adding Liquidity

Join the LSU Pool

The LSU Pool accepts the majority of LSU tokens for validators that:

* Are accepting stake
* Have consistently high uptimes
* Do not have very high fees

The above eligibility criteria ensure decent yield performance of the pool. Underperforming validators could impose a lower yield on the pool (although the implementation of liquid staking in the Radix protocol does not include slashing so LSUs can never go down in value versus XRD).

Currently, CaviarNine can determine which LSUs are eligible for the pool by using its admin badge. CaviarNine can also remove underperforming LSUs from the pool using the accumulated [reserve fee](/products-floop/lsu-pool/move-stake-and-instant-unstake#fees). It is envisaged this curation task will be transferred to the [FLOOP DAO](/tokens/floop#floop-dao) in the future.

Liquidity can be added via the Validator page or directly on the LSU Pool page.

{% hint style="info" %}
There is NO FEE for adding liquidity to LSU Pool
{% endhint %}

### Via the Validator page

<figure><img src="/files/NHWMF9YPdf6xTLxe1jXI" alt=""><figcaption><p>Choose the LP option</p></figcaption></figure>

The Validator page clearly shows which LSUs are eligible for the LSU Pool (far right column).

To add liquidity, simply hover over the validator you're staked to and click the **LP** button to bring up a simple dialog box for adding liquidity.

<figure><img src="/files/akXDDkx2sAfNKjoM9iKo" alt="" width="375"><figcaption></figcaption></figure>

### Via the LSU Pool page

The LSU Pool page has a simple dialog box for providing liquidity and shows your current pool position via **My Liquidity**.

<figure><img src="/files/5ZcgWCPF2tbiSo6mn418" alt="" width="375"><figcaption></figcaption></figure>

### LSULP token - your liquidity

When you add liquidity to the pool you receive 2 items:

* LSULP tokens representing your share of the value of the LSU Pool
* A soulbound credit receipt that records which type of LSU you deposited

The credit receipt is described in more detail [here](/products-floop/lsu-pool/credit-receipt) and is important for removing liquidity.

The composition of the LSU Pool liquidity can be seen in graphical and tabular form:

<figure><img src="/files/3X0RBJgiXGQBjFAv4EmT" alt="" width="375"><figcaption><p>LSU Pool composition</p></figcaption></figure>


# Removing Liquidity

Taking back your LSUs

Liquidity can be removed from the LSU Pool page. Simply click the **Remove Liquidity** tab and select the desired amount of LSULP tokens to redeem: for your chosen LSU.

<figure><img src="/files/s1wnm9OZGnXzypab0jpb" alt="" width="375"><figcaption><p>Choose the LSU to reclaim</p></figcaption></figure>

You can choose, via the dropdown, which LSU tokens you wish to receive when removing liquidity.

It is possible that there will be insufficient tokens of your desired LSU (including the original LSUs you deposited) and you may need to redeem partially in other LSU tokens. This could occur due to swapping and unstaking activities in the pool in the time since you originally provided liquidity.

Owners of LSULP tokens who do not have a *credit receipt* NFT (ie they did not originally deposit LSUs and received LSULPs indirectly) can still redeem for any LSU that has liquidity but will be subject to fees ([see below](#redeeming-for-any-lsus)).

{% hint style="info" %}
It is possible when removing liquidity that there are insufficient LSU tokens of the type you originally deposited. In that case you will need to redeem, partially or in whole, in other LSU tokens.
{% endhint %}

### Redeeming for the original LSUs deposited

{% hint style="info" %}
If you are in possession of the *credit receipt* and there is sufficient liquidity in your original deposited LSUs, you can redeem for them at **zero cost**.
{% endhint %}

### Redeeming for different LSU tokens

If you are either:

* In possession of the credit receipt and want to redeem for a different LSU (or there is insufficient liquidity in the original LSU)
* An owner of LSULP tokens but not a credit receipt holder, redeeming for LSUs

There will be a `0.07%` fee charged on redeeming. This is consistent with the fee charged to [move validators](/products-floop/lsu-pool/move-stake-and-instant-unstake#fees) and the breakdown is the same:

* `0.05% switching fee` which goes to the LSU Pool itself
* `0.01% protocol fee` which goes to the [FLOOP Treasury](/tokens/floop)
* `0.01% reserve fee` which accumulates and can be used in the future to remove bad LSUs from the pool

The next section has more detail on the [credit receipt](/products-floop/lsu-pool/credit-receipt).

### LSU Pool and Zero Impermanent Loss

The concept of impermanent loss (IL) is typically brought up when considering liquidity provision (LP) on a DEX. In the classic example:

* LP provides tokens A and B
* There is a large subsequent move in the underlying price
* LP removes liquidity - getting much more A than B (or vice versa) plus earned fee income
* The LP may have been better off not providing liquidity at all

IL is an interplay between fee income earned from volume and volatility in a range versus the move in spot.

{% hint style="info" %}
There is no Impermanent Loss for LSU Pool
{% endhint %}

For LSU Pool, you are staking a single LSU token type and you may possibly withdraw a different LSU.

**Let's look at a simplified example:**

We have 2 LPs - Alice and Bob - who have provided 10 XRD liquidity each to LSU Pool in LSU1 and LSU2 respectively.

Alice and Bob each own 50% of the LSULP tokens that are minted since they each own 50% of the pool.&#x20;

Let's assume there are no other LPs or LSUs in the pool and that LSU1 underperforms (eg because of bad validator performance). Initially the LSU Pool looks like:&#x20;

| <p><br></p> | LSU1 price in XRD | LSU2 price in XRD | Pool holding LSU1 | Pool holding LSU2 | Pool value (XRD) |
| ----------- | ----------------- | ----------------- | ----------------- | ----------------- | ---------------- |
| Initially   | 1.00              | 1.00              | 10                | 10                | 20.00            |

In this case, we jump forward 6 weeks in time and we see that LSU1 has been massively underperforming (in fact it is stuck at 1.00 since the validator was badly performing).

| <p><br></p>   | LSU1 price in XRD | LSU2 price in XRD | Pool holding LSU1 | Pool holding LSU2 | Pool value (XRD) |
| ------------- | ----------------- | ----------------- | ----------------- | ----------------- | ---------------- |
| Initially     | 1.00              | 1.00              | 10                | 10                | 20.00            |
| 6 weeks later | 1.00              | 1.01              | 10                | 10                | 20.10            |

The pool value is 20.10 XRD.

Alice removes her liquidity, choosing LSU2 rather than the original LSU1. She sends in her LSULP tokens and gets back 10.05 XRD worth of LSU2 ie 10.05 / 1.01 = 9.9505 LSU2.

Bob now owns 100% of the pool. Which looks like

| <p><br></p>   | LSU1 price in XRD | LSU2 price in XRD | Pool holding LSU1 | Pool holding LSU2 | Pool value (XRD) |
| ------------- | ----------------- | ----------------- | ----------------- | ----------------- | ---------------- |
| 6 weeks later | 1.00              | 1.01              | 10                | 0.0495            | 10.05            |

If Bob removes his liquidity now, he gets 10.05 XRD of LSUs, just in a combination of both LSUs (10 of LSU1 and 0.0495 of LSU2). He can keep these or unstake for XRD in the usual manner.

*There is no slippage or loss here.*

**Nuance around fees:**

The above analysis ignores fees earned by the pool during the 6 weeks.

It also assumes that there was no pool management in the 6 weeks.

It also ignores the 0.07% fee that an LP will pay when unstaking for a different LSU. So Bob would have paid 0.07% for removing his liquidity (but the pool would have earned 0.05% switching fee from Alice unstaking for her different LSU). Fees were discussed [above](#redeeming-for-any-lsu-tokens).

**Further on non-performing LSUs:**

As seen above, a non-performing LSU can apply a drag to the NAV of the pool (ie the LSULP/XRD rate). While a LSU price can never go down, too many non-performing LSUs in the pool could cause it to yield less than a typical validator.

For this reason, the LSU Pool eligibility is managed - as [discussed here](/products-floop/lsu-pool/adding-liquidity).

####


# Credit Receipt

This page is still under construction....

As described in the previous section, the LSU Pool uses a **soulbound NFT credit receipt** to keep track of liquidity added and removed.

`resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9`

[explorer link](https://dashboard.radixdlt.com/resource/resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9)

{% hint style="info" %}
Possession of LSULP tokens and the credit receipt allows for **zero fee** removal of liquidity *if there is sufficient LSU Pool liquidity of the desired LSU tokens.*
{% endhint %}

Here's some more details about this NFT:

### It is soulbound

This means it remains in your wallet, cannot be moved and is associated with you and your LSU Pool activity.

### It is burnable (by you)

The NFT is burnable. Since it is soulbound and cannot be moved, it is only burnable by you in your wallet.

### Each wallet only needs 1 NFT&#x20;

If you add multiple different LSUs over time you don't get multiple credit receipts. Instead the data associated with the NFT is updated to include new LSU balances.

### Its data is updated based on your activity

Similar to above, if you remove liquidity or later add liquidity, the NFT data is updated to reflect that.


# Manifests

Below are the manifest for the LSU Pool

You don't need CaviarNine to interact with any smart contract. All you need is the manifest and to submit it the Radix network. An easy way to submit is already supplied by Radix via their dashboard: <https://console.radixdlt.com/transaction-manifest>

## LSU Pool Component Address:

Being the LSU Pool is just one component here is it's address which has been added in the below manifests.

```
component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp
```

## LSULP Resource Address:

This resource address below is the address for the liquidity token of the LSU Pool

```
resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf
```

## LSU Credit Receipt Resource Address:

This resource address below is the address for the credit receipt NFT token of the LSU Pool

```
resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9
```

## Add Liquidity - No Credit Receipt

When adding liquidity using this method you will get back two buckets:

* LSULP - The liquidity token
* Credit Receipt NFT - A new soulbound credit receipt NFT that tracks your credits

```
CALL_METHOD 
    Address("{ACCOUNT}") 
    "withdraw" 
    Address("{LSU_TOKEN}")
    Decimal("{AMOUNT}")
;
TAKE_ALL_FROM_WORKTOP
    Address("{LSU_TOKEN}") 
    Bucket("lsu_tokens")
;

CALL_METHOD 
    Address("component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp") 
    "add_liquidity" 
    Bucket("lsu_tokens")
    Enum<0u8>()
;

CALL_METHOD 
    Address("{ACCOUNT}") 
    "deposit_batch" 
    Expression("ENTIRE_WORKTOP")
;
```

## Add Liquidity - Using Credit Receipt

When adding liquidity using this method you will get back 1 bucket of LSULP tokens and update your soulbound Credit receipt token with the additional LSU credit. LSU -> LSULP\
\
The following manifest requires your Credit Receipt NFT ID from your wallet. If you don't have one use the method above.

```
LSU_POOL_CREDIT_RECEIPT_ID - Get this from your wallet
```

Manifest:

```
CALL_METHOD 
    Address("{ACCOUNT}") 
    "withdraw" 
    Address("{LSU_TOKEN}")
    Decimal("{AMOUNT}")
;
TAKE_ALL_FROM_WORKTOP
    Address("{LSU_TOKEN}") 
    Bucket("lsu_tokens")
;
CALL_METHOD
    Address("{ACCOUNT}") 
    "create_proof_of_non_fungibles"
    Address("resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{LSU_POOL_CREDIT_RECEIPT_ID}")
    )
;
CREATE_PROOF_FROM_AUTH_ZONE_OF_NON_FUNGIBLES
    Address("resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{LSU_POOL_CREDIT_RECEIPT_ID}")
    )
    Proof("credit_proof")
;

CALL_METHOD 
    Address("component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp") 
    "add_liquidity" 
    Bucket("lsu_tokens")
    Enum<1u8>(
        Proof("credit_proof")
    )
;

CALL_METHOD 
    Address("{ACCOUNT}") 
    "deposit_batch" 
    Expression("ENTIRE_WORKTOP")
;
```

## Remove Liquidity - No Credit Receipt:

Using this method will remove liquidity from the pool. Find more about the credit receipt [here](/products-floop/lsu-pool/credit-receipt) LSULP -> LSU

```
CALL_METHOD 
    Address("{ACCOUNT}")  
    "withdraw" 
    Address("resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf")
    Decimal("{AMOUNT}")
;
TAKE_ALL_FROM_WORKTOP
    Address("resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf") 
    Bucket("lp_tokens")
;

CALL_METHOD 
    Address("component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp") 
    "remove_liquidity" 
    Bucket("lp_tokens")
    Address("{LSU_TOKEN}")
    Enum<0u8>()
;

CALL_METHOD 
    Address("{ACCOUNT}")  
    "deposit_batch" 
    Expression("ENTIRE_WORKTOP")
;
```

## Remove Liquidity - Using Credit Receipt

Using this method will remove liquidity from the pool. By presenting your credit receipt, if you have credits you will not get charged up to the credit amount for that LSU you have requested. Find more about the credit receipt [here](/products-floop/lsu-pool/credit-receipt) LSULP -> LSU

```
CALL_METHOD 
    Address("{ACCOUNT}")  
    "withdraw" 
    Address("resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf")
    Decimal("{AMOUNT}")
;
TAKE_ALL_FROM_WORKTOP
    Address("resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf") 
    Bucket("lp_tokens")
;
CALL_METHOD
    Address("{ACCOUNT}")
    "create_proof_of_non_fungibles"
    Address("resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{LSU_POOL_CREDIT_RECEIPT_ID}")
    )
;
CREATE_PROOF_FROM_AUTH_ZONE_OF_NON_FUNGIBLES
    Address("resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9")
    Array<NonFungibleLocalId>(
        NonFungibleLocalId("{LSU_POOL_CREDIT_RECEIPT_ID}")
    )
    Proof("credit_proof")
;

CALL_METHOD 
    Address("component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp") 
    "remove_liquidity" 
    Bucket("lp_tokens")
    Address("{LSU_TOKEN}")
    Enum<1u8>(
        Proof("credit_proof")
    )
;

CALL_METHOD 
    Address("{ACCOUNT}")  
    "deposit_batch" 
    Expression("ENTIRE_WORKTOP")
;
```

## Swap

How to swap on the LSU Pool

```
CALL_METHOD 
    Address("{ACCOUNT}") 
    "withdraw" 
    Address("{LSU_TOKEN}")
    Decimal("{AMOUNT}")
;
TAKE_ALL_FROM_WORKTOP
    Address("{LSU_TOKEN}") 
    Bucket("lsu_tokens")
;

CALL_METHOD 
    Address("component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp") 
    "swap" 
    Bucket("lsu_tokens")
    Address("{LSU_PAYING}")
;

CALL_METHOD 
    Address("{ACCOUNT}") 
    "deposit_batch" 
    Expression("ENTIRE_WORKTOP")
;
```


# LSU Pool Fees

LSU Pool Fee Structure

Here we collate the fee information from the earlier sections.

<table data-full-width="true"><thead><tr><th width="228">Action</th><th width="208.33333333333331">Fee</th><th>Information</th></tr></thead><tbody><tr><td>Adding Liquidity</td><td>free</td><td>No fee for adding liquidity</td></tr><tr><td><a href="/pages/cmyZpk7GEcKCM2zD4Dem#fees">Swapping LSUs</a></td><td><code>0.07%</code></td><td><code>0.05%</code> credited to the LSU Pool<br><code>0.01%</code> for FLOOP Treasury<br><code>0.01%</code> for reserve fee</td></tr><tr><td>Removing Liquidity<br>(for original LSU)</td><td>free</td><td>No fee to remove original LSU (if possessing credit receipt)</td></tr><tr><td><a href="/pages/YjVu6kMfD6yYMxGEEjF0#redeeming-for-different-lsu-tokens">Removing Liquidity</a><br>(for different LSU)</td><td><code>0.07%</code></td><td>Same fee as per swapping above for any amount in a different LSU or if not in possession of credit receipt</td></tr><tr><td>Removing Liquidity<br>(different wallet or no <a href="/pages/bW3FS9Jeettdl5icx8wT">credit receipt</a>)</td><td><code>0.07%</code></td><td>If you possess LSULP without a credit receipt eg:<br>- from buying LSULP directly on the market<br>- from moving LSULP to a different wallet to credit receipt</td></tr><tr><td><a href="/pages/cmyZpk7GEcKCM2zD4Dem#fees-and-slippage-considerations">Instant Unstake of LSU</a></td><td><code>0.20% + slippage</code></td><td><p>This is effectively a Shape Liquidity product.</p><p>You are adding the LSU to the LSU Pool to get LSULP.<br>Then you are selling LSULP directly in the LSULP/XRD concentrated pool which has fees and potential slippage.</p></td></tr></tbody></table>


# Simple Pools


# Overview

Simple Pools on CaviarNine offer an innovative way to provide liquidity and execute trades using  a weighted pools with flexible fee structures. Unlike traditional liquidity pools, Simple Pools allow for customizable token weight distributions, enabling more efficient pricing mechanisms.

### Key Features

* **Weighted Liquidity Distribution**: Each token in the pool can have a predefined weight between **10% and 90%**, affecting the price impact of swaps.
* **Flexible Fees**: Pools have customizable swap fees ranging from **0.01% to 2%**, with configurable protocol and treasury fee shares.
* **Liquidity Provider Tokens (LP Tokens)**: Users receive LP tokens representing their share of the pool, which can be redeemed at any time.
* **LP Tokens are Radix Native:** User LP tokens are natively supported by the Radix Wallet for simple breakdown of there valuation
* **Efficient Swaps**: The pool uses a simple swap function to ensure optimal price execution based on liquidity weights.
* **On-Ledger Transactions**: All transactions are executed fully on-ledger, ensuring transparency and security.

### How It Works

1. **Pool Creation**
   * A user can create a new Simple Pool by selecting two assets and defining their respective weights and the pool fees
   * Starting a pool is free (ignore the tiny gas).
2. **Adding Liquidity**
   * Liquidity providers contribute tokens in proportion to the pool's weight distribution.
   * They receive LP tokens that track their share in the pool.
   * Liquidity is spread over the entire spot range, so you don’t have to worry about it ever being unused or concentrated in a way that limits trading activity. This ensures continuous availability of liquidity for all market participants.
3. **Swapping Assets**
   * Users can swap one asset for another within the pool.
   * The output amount is calculated based on the token reserves, liquidity weights, and swap fee deductions.
   * The CaviarNine Aggregator will automatically pick up any new pool and instantly route to it.
4. **Withdrawing Liquidity**
   * LP token holders can redeem their tokens for underlying assets at the pool’s current reserves.
   * The redemption value is calculated dynamically based on pool reserves.


# Create a Pool

### Overview

Creating a liquidity pool on CaviarNine is a simple process that allows users to provide liquidity for token pairs and earn trading fees. Follow the steps below to set up your own pool.

### Steps to Create a Pool

#### 1. Navigate to the Simple Pools Page

* Go to [CaviarNine Simple Pools](https://www.caviarnine.com/earn/simple-pool).
* Click on the **"Create a Pool"** button.

<figure><img src="/files/jm3Q8K6rw7zdmbMBOxoz" alt=""><figcaption></figcaption></figure>

####

<figure><img src="/files/b49JE64Ia8z668hFmOsu" alt=""><figcaption></figcaption></figure>

#### 2. Select Tokens

* Choose the two tokens you want to provide liquidity for.
* Ensure that both tokens are available in your wallet.

#### 3. Set Trading Fees

* Define the trading fee percentage for swaps within your pool.
* This fee will be distributed to liquidity providers as a reward.

#### 4. Confirm the Starting Mid Price

* The system will suggest an initial mid price.
* Confirm or adjust the price if necessary.
* If the price is outside a reasonable range, you may see a warning symbol.

<figure><img src="/files/VDvxSYglsEpz3I8SuXCG" alt=""><figcaption></figcaption></figure>

#### 5. Set Token Balance and Ratio

* Adjust the token balance to maintain the correct liquidity ratio.
* The weight percentage will be displayed (e.g., 50% CAVIAR / 50% XRD).

#### 6. Add Tokens to the Pool

* Enter the number of tokens to add or/and slide the slider. If you can't slide the slider then you don't have enough of one of the tokens
* Since pools operate on a ratio basis, both tokens must be added in proportion.

#### 7. Create the Pool

* Click the **"Create Pool"** button to finalize the process.
* Your liquidity pool is now live and ready for swaps!

### Additional Information

* Liquidity providers earn fees from each trade occurring within the pool.
* Once created, your pool will be available on the CaviarNine platform for others to trade.


# FEES

Fee information per product

{% content-ref url="/pages/InfGvQs4fG1j6PWG92xw" %}
[Order Book Fees](/products-floop/order-book/order-book-fees)
{% endcontent-ref %}

{% content-ref url="/pages/KwSH25Mr3loQ1HZyW4NL" %}
[LSU Pool Fees](/products-floop/lsu-pool/lsu-pool-fees)
{% endcontent-ref %}

{% content-ref url="/pages/zMPA8L69jn9cqhUri2tN" %}
[Aggregator Fees](/products-floop/aggregator/aggregator-fees)
{% endcontent-ref %}

{% content-ref url="/pages/Hg96BXoDsvSYTcl0RJJu" %}
[Shape Liquidity Fees](/products-floop/shape-liquidity/shape-liquidity-fees)
{% endcontent-ref %}


# HyperStake

HyperStake's self-adjusting LSULP/ XRD pool delivers high rewards with zero upkeep, earning fees from instant unstakers and 7-day depositors.

### Overview

HyperStake is a novel staking product on CaviarNine that allows you to earn high rewards with **zero maintenance**. By adding liquidity to the innovative LSULP/XRD HyperStake pool, you’re not just staking—you’re enabling instant unstaking for users who need their XRD fast, skipping the usual one-week wait. In return, you earn a slice of every trading fee, boosted by our concentrated liquidity range that targets the action around the NAV price for maximum efficiency. With a **no-loss guarantee** and fully automated pool management, HyperStake is your effortless path to passive income on the Radix blockchain.

***

### Key Features

* **Zero Maintenance**: The pool automatically adjusts to market shifts, so you can set it and forget it.
* **High Rewards**: Earn from instant unstakers and 7-day depositors with a design built for maximized fee generation.
* **No-Loss Guarantee**: Your principal XRD is protected, ensuring you don’t lose your initial investment.
* **Self-Tracking Pool**: The pool’s concentrated liquidity automatically tracks the optimal price range for fee earning. So no replacing liquidity!
* **Radix Native**: Fully integrated with Radix for seamless transactions and wallet support.
* **Open Sources**: <https://github.com/caviarnine/caviarnine-scrypto/tree/main/hyper_stake>

***

### How It Works

HyperStake leverages a unique LSULP/XRD pool on CaviarNine. Here’s a simplified breakdown:

1. **Liquidity Provision**: You add XRD + LSULP to the pool and receive LP tokens representing your share.
2. **Fee Generation**: The pool earns fees from three main sources:
   * **Instant unstakers** who pay a premium to bypass the standard 7-day unstaking period.
   * **7-day depositors** who stake their XRD for a fixed term.
   * **Traders swapping** between LSULP and XRD
3. **Concentrated Liquidity**: The pool’s liquidity is concentrated around the NAV price, maximising fee generation from trades near this key price point. The HyperStake Pool is configured at -1.5% to 0% of the NAV price of LSULP to XRD.
4. **Self-Adjustment**: The pool automatically adjusts its liquidity range based on market conditions, ensuring optimal fee earning without any user intervention.
5. **No-Loss Protection**: A built-in mechanism guarantees that you won’t lose your principal, even in volatile market conditions.

***

### CAVIAR Products and Fees

HyperStake is the first CAVIAR product where 10% of the fees earned in the pool are sent to the CAVIAR fee vaults to decrease the CAVIAR token supply.\
\
The fee breakdown:

* 80% remains in the pool for LPs
* 10% goes to CAVIAR burning via the fee vaults
* 10% is allocated to the treasury

***

### Manifest

**Common addresses:**

```
LSULP_RESOURCE = resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf
XRD_RESOURCE = resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd
HYPERSTAKE_COMPONENT = component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf
HYPERSTAKE_LP_RESOURCE = resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m
```

**Adding Liquidity:**

```
CALL_METHOD
    Address("<YOUR_ACCOUNT_ADDRESS>")
    "withdraw"
    Address("resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf")
    Decimal("LSULP_AMOUNT")
;
CALL_METHOD
    Address("<YOUR_ACCOUNT_ADDRESS>")
    "withdraw"
    Address("resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd")
    Decimal("XRD_AMOUNT")
;
TAKE_ALL_FROM_WORKTOP
    Address("resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf")
    Bucket("bucket1")
;
TAKE_ALL_FROM_WORKTOP
    Address("resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd")
    Bucket("bucket2")
;
CALL_METHOD
    Address("component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf")
    "add_liquidity"
    Bucket("bucket1")
    Bucket("bucket2")
;
CALL_METHOD
    Address("<YOUR_ACCOUNT_ADDRESS>")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```

**Removing Liquidity:**

```
CALL_METHOD
    Address("<YOUR_ACCOUNT_ADDRESS>")
    "withdraw"
    Address("resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m")
    Decimal("HLP_AMOUNT")
;
TAKE_ALL_FROM_WORKTOP
    Address("resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m")
    Bucket("bucket1")
;
CALL_METHOD
    Address("component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf")
    "remove_liquidity"
    Bucket("bucket1")
;
CALL_METHOD
    Address("<YOUR_ACCOUNT_ADDRESS>")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```

**Swapping:**

```
CALL_METHOD
    Address("<YOUR_ACCOUNT_ADDRESS>")
    "withdraw"
    Address("<LSULP_OR_XRD_RESOURCE>")
    Decimal("<LSULP_OR_XRD_AMOUNT>")
;
TAKE_ALL_FROM_WORKTOP
    Address("<LSULP_OR_XRD_RESOURCE>")
    Bucket("bucket1")
;
CALL_METHOD
    Address("component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf")
    "swap"
    Bucket("bucket1")
;
CALL_METHOD
    Address("<YOUR_ACCOUNT_ADDRESS>")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;
```


# CAVIAR Airdrop

## NO MORE AIRDROPS 😁 - Program discontinued

🌟 CAVIAR Airdrop Update 🌟

Dear community, we’re wrapping up the CAVIAR Airdrop Program with the final CAVIAR/XRD pool closing on Friday the 17th of January 2025. The last airdrop rewards will be distributed a few days after the program concludes.

We deeply thank everyone who participated and contributed to the success of this initiative. Your support has been the heartbeat of this program.

💬 Without community, we stand alone. Together, we create something greater than ourselves.

***

## Old Program Below - Discontinued

Welcome to the CaviarNine Liquidity Incentive Program, an initiative aimed at boosting the liquidity of our platform and enhancing the Total Value Locked (TVL) on Radix. By encouraging community members to become liquidity providers (LPs) in our select pools, we're not only benefiting LPs but also elevating the trading experience for the entire Radix community.

### Overview of the Liquidity Incentive Program

The Liquidity Incentive Program invites community members to contribute tokens to specific Shape Liquidity incentive pools, becoming LPs and earning rewards in the form of CAVIAR tokens. These rewards are calculated based on the amount, duration and activity of your liquidity contribution, with a particular emphasis on active liquidity—tokens that are near the current market price, thus maximising swapping potential.

### Replacing the earlier CAVIAR Airdrop

This program supersedes the previously announced CAVIAR airdrop, aligning more closely with the timing of RDX Works liquidity incentives. It represents a more integrated and strategic approach to rewarding our community for their contributions.

### How It Works: Simple, Engaging, Rewarding

Entering the program is straightforward and potentially lucrative. By contributing tokens to any of our specific incentive pools, you become eligible for CAVIAR rewards. These rewards are designed to recognise and incentivise the provision of active liquidity, enhancing the overall trading efficiency on our platform.

#### Multiple Rewards

Participants can expect to receive multiple forms of rewards:

* **Airdrop Rewards**: An allocation of 100,000 CAVIAR will be distributed weekly to each of the selected incentive pools, with airdrops scheduled for the coming months.
* **Fee Income**: LPs will continue to earn their share of trading fees generated within the liquidity pools, in addition to the airdrop rewards.

#### Selected Pools

These are the pools that pay CAVIAR airdrop rewards.

* The [CAVIAR/XRD pool](https://www.caviarnine.com/earn/shape-liquidity/pool/component_rdx1cpd42aun4cqhgxnj7w8m0hks9ztum3f8dq39p6tcp6nwgwzwhhk796), weekly allocation of 100,000 CAVIAR rewards.

### What is Active Liquidity?

In the context of our CaviarNine Liquidity Incentive Program, 'Active Liquidity' refers to the tokens within a liquidity pool that are available for trading at or near the current market price. Our program rewards liquidity providers based on their contribution to these critical price ranges, which are determined by a concept known as '[bins](/products-floop/shape-liquidity/bins)'.&#x20;

Weekly rewards for liquidity providers are determined by comparing their active liquidity to the total active liquidity in the pool. The more a provider's liquidity falls within the active bins, the greater their share of the rewards.

Active liquidity for the CAVIAR/XRD pool is defined by 3 bins - the bin spanning the current spot price and the bins immediately below and above it.

Active liquidity for the other pools is defined solely by the bin spanning the current spot price (since the bins in these pools are wider).

#### Example: Active Liquidity Calculation

For illustration purposes, let's consider the [CAVIAR/XRD pool](https://www.caviarnine.com/earn/shape-liquidity/pool/component_rdx1cpd42aun4cqhgxnj7w8m0hks9ztum3f8dq39p6tcp6nwgwzwhhk796). In this pool, each bin is set to be 1% wide. When a liquidity provider uses the Advanced Add Liquidity widget and sets the Mid Price to the current spot price, setting the range to **3 bins wide** will display the range of the *current* active liquidity.

The 'Min - Max' values represent the price range of the current active liquidity. For instance, if the Mid Price is set at 0.29648, with a bin width of 10, the active liquidity range would be 0.29238 to 0.30129.

<figure><img src="/files/Z8SigAK4wXRyClFjxG4C" alt=""><figcaption><p>Section of the Advanced Add Liquidity widget as of 2nd Feb 2024</p></figcaption></figure>

Note: we are not suggesting you need to concentrate your liquidity in only 3 bins. We are merely highlighting the concept of active liquidity. Please choose the liquidity profile that best suits your view and risk tolerance. The active liquidity bins will change over time as spot moves around as a consequence of trading.

### Program Timeline

* **Launch Date**: The program kicked off on Friday, 26th January 2024, with the CAVIAR/XRD pool.
* **Duration**: The program is slated to run for a minimum of 6 months, with the possibility of extension or modification based on its performance.

#### Reward Mechanics: Fair and Transparent

We employ a snapshot-based approach for calculating rewards, ensuring fairness and accuracy in the distribution of airdrops. Rewards are distributed on a monthly, rolling basis, proportional to each user's active liquidity in a given pool for the preceding weeks.

To preserve the integrity of our Liquidity Incentive Program and ensure a fair distribution of rewards, **we reserve the right to reduce or deny the airdrop to participants deemed to be gaming the system for an unfair advantage over other LPs**. This includes, but is not limited to, the provision of sporadic or transient liquidity with the sole aim of airdrop farming, which does not genuinely contribute to market health or benefit traders.

### Terms and Insights

* **No Limits**: There are no minimum or maximum contribution limits. Higher liquidity contributions, especially near current market prices, increase your chances of earning a larger share of the rewards.
* **Multiple Pools**: Participants are free to contribute liquidity to various pools simultaneously, with rewards calculated separately for each pool.
* **Active Liquidity**: Our program places a premium on liquidity that is near market prices, as it contributes more significantly to trades and overall market health.

### Disclaimer

Please note that the rewards, timelines and airdrop schedule outlined in this program are subject to change or termination based on participation levels and the overall performance of the program.


# Radix Ignition

## NO MORE Ignition 😁 - Program discontinued by Radix

We deeply thank everyone who participated and contributed to the success of this initiative. Your support has been the heartbeat of this program.

💬 Without community, we stand alone. Together, we create something greater than ourselves.

***

## Radix Ignition - Closed

* Boost Radix's TVL in wrapped assets
* Receive an upfront bonus (up to 20%)
* Earn trading fees
* Benefit from impermanent loss protection
* Eligible for CAVIAR airdrops

## Summary of Radix Ignition

### Overview

Radix Ignition is a pioneering liquidity incentive initiative valued at over $10 million, crafted to significantly enhance liquidity for important cryptocurrencies such as USDC, USDT, wBTC and ETH within the Radix Network.&#x20;

This incentive program promises to match the liquidity provided by participants with an equivalent amount of XRD tokens, thereby doubling the available liquidity. Contributors are also rewarded with up to 20% of their investment in XRD as an upfront bonus, in addition to earning trading fees and receiving comprehensive protection against impermanent loss.

Commencing on March 14, 2024, Radix Ignition will be integrated with prominent Radix decentralised exchanges (DEXs), including CaviarNine, establishing a straightforward and efficient pathway for users to partake in the initiative through designated liquidity pools. More details can be found [here](https://www.radixdlt.com/blog/project-ignition-10m-liquidity-incentive-program-for-wrapped-assets-on-radix)

<div data-full-width="false"><figure><img src="/files/D82ZVDDK25InGUTqXlKr" alt=""><figcaption><p>CaviarNine x Radix Ignition widget</p></figcaption></figure></div>

### Participation Process&#x20;

Participation is simple:

1. Visit <https://www.caviarnine.com/ignition>
2. Connect your [Radix Wallet](https://wallet.radixdlt.com/)
3. Select one of xUSDC, xUSDT, xWBTC or xETH from the dropdown. Don't have any? See below.
4. Type in the amount you want to add
5. Choose your [Lock Up time](#lock-up-time) in months
6. See your XRD reward (you get this straight away)
7. Press the Ignite button and confirm on your Radix Wallet

### Wrapped Tokens on Radix: xUSDC, xUSDT, xWBTC and xETH

To participate in the Radix Ignition program you need to add one of the 4 wrapped tokens xUSDC, xUSDT, xWBTC or xETH. If you don't have any of these tokens and you want to participate you have the following options:

* Bridge the tokens from Ethereum using [Instabridge](https://www.radixdlt.com/blog/project-ignition-10m-liquidity-incentive-program-for-wrapped-assets-on-radix) which requires KYC
* Bridge the tokens using [Keyrock's OTC desk](https://keyrock.eu/otc/) (50k USD or more)&#x20;
* Buy\* the tokens on a Radix DEX that already has liquidity bridged by others. [Buy now...](https://www.caviarnine.com/trade)

\*Please note that buying the wrapped tokens on a Radix DEX does help the Ignition program as it potentially encourages arbitragers to bridge tokens to take advantage of price disparity.

### Lock Up time

For Ignition, Radix has 4 lock up time choices: <br>

<figure><img src="/files/haVp3DaoLjHiZCLyXzng" alt=""><figcaption></figcaption></figure>

### CAVIAR Airdrop

Participating in the Ignition program automatically enrols you in the CAVIAR airdrop program.

Ignition pool active liquidity providers share 500,000 CAVIAR per week per pool.

You can see your potential CAVIAR rewards on the [reward board](https://www.caviarnine.com/rewardboard).&#x20;

Find out more about the [CAVIAR Airdrop program](/ecosystem/caviar-airdrop).

### FAQ

<details>

<summary>What are the official tokens for the Ignition program:</summary>

xwBTC: <https://www.caviarnine.com/tokens/resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75>\
\
xUSDC:\
<https://www.caviarnine.com/tokens/resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf>\
\
xETH:\
<https://www.caviarnine.com/tokens/resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww>\
\
xUSDT:\
<https://www.caviarnine.com/tokens/resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw>

</details>

<details>

<summary>Do I have to do KYC?</summary>

No! KYC is only needed for using the Instabridge Service

</details>

<details>

<summary>Can I pick my liquidity concentration shape / range?</summary>

Nope! The Radix Ignition smart contract adapter does all the shape and range for your tokens so you don't have to, making the risk similar to uniswap v2 style pools.

</details>

<details>

<summary>Can I exit the program early?</summary>

No your tokens will be locked for the time period that you choose

</details>

### Extra Resources and Links

Ignition Radix Program blog:\
<https://www.radixdlt.com/blog/project-ignition-10m-liquidity-incentive-program-for-wrapped-assets-on-radix>\
\
Bridging with Keyrock OTC:\
<https://www.radixdlt.com/blog/project-ignition-update-getting-wrapped-assets-on-radix>\
\
KYC platform with Instapass (for Instabridge only) : \
<https://www.instapass.io/>\
\
Bridging with Instabridge: \
<https://www.instabridge.io/> \
\
Official Radix Ignition Docs:\
<https://uploads-ssl.webflow.com/6053f7fca5bf627283b582c2/65c3bfd9846b7773b8dd7148_project-ignition-details.pdf>

Article on the Block Chain Reporter\
<https://blockchainreporter.net/radix-network-unveils-project-ignition-a-10-million-liquidity-incentive-program/>


# Token Bridge

Update your FLOOP and CAVIAR for Babylon

As discussed earlier in this document, FLOOP and CAVIAR were originally minted prior to the Babylon release of Radix.

CaviarNine offers a simple 1-way bridge to allow users to convert their legacy tokens to the Babylon utility DAO tokens.

## How to Bridge

If you have a wallet connected and have legacy tokens in it, then you will see the Bridge page appear.

<figure><img src="/files/M7rEXXxXuzPGXseqqD1a" alt=""><figcaption><p>Bridge page (pink tab) appears when connected and when holding legacy tokens</p></figcaption></figure>

Bridging is a straightforward process:

* Choose **Bridge All** to seamlessly move all tokens across
* Choose **Don't want to bridge all** to enter the exact amount to bridge.

{% hint style="warning" %}
This is a 1-way bridge operation. All legacy tokens bridged will remain locked, forever, in the bridge smart contract.
{% endhint %}


# Fee Vaults

Are components where the protocol fees are collected from the FLOOP and (future) CAVIAR product ecosystems

## We have a dedicated page to taking advantage of fees:

<https://www.caviarnine.com/fee-vaults><br>

## Component Addresses

The FLOOP Ecosystem has 2 component vaults:

```shellscript
component_rdx1cqvfnpl0ld49rhwyhu4v3r05962yeplmasggtzlu9r2dmh7amx6vpn
component_rdx1crmhkatyjrw0070nsusdm4adwr5s3eaysmevxlvaxx6fspxkwdhlua
```

The CAVIAR Ecosystem has no fee vaults set up yet as no products have been launched.

```
<coming soon>
```

## Useful Component Arbitrage Methods

There are three methods anyone can call to get some useful information about arbitrage opportunities:

### get\_swap\_vault\_amount

This method returns the amount of TOKENS of a specific RESOURCE\_ADDRESS that are available when swapped for FLOOP. This amount increases over time as protocol fees are collected from the [Aggregator](/products-floop/aggregator), [LSU Pool](/products-floop/lsu-pool), [Shape Liquidity](/products-floop/shape-liquidity) and the [Order Book](/products-floop/order-book).\
\
manifest:

```
CALL_METHOD 
    Address("{COMPONENT_ADDRESS_FEE_VAULTS}") 
    "get_swap_vault_amount"
    Address("{RESOURCE_ADDRESS}");
```

### get\_swap\_price

This method tells you how much FLOOP you need to send for a given RESOURCE\_ADDRESS to receive the amount of TOKENS from the RESOURCE\_ADDRESS vault, (returned from the *get\_swap\_vault\_amount* above). This amount of FLOOP decreases over time, encouraging users to empty the fee vaults.\
\
manifest:

```
CALL_METHOD
    Address("{COMPONENT_ADDRESS_FEE_VAULT}") 
    "get_swap_price"
    Address("{RESOURCE_ADDRESS}");
```

### swap

Finally if you want to send the amount of FLOOP (calculated from get\_swap\_price) for the amount of TOKENS (calculated from *get\_swap\_price*) for RESOURCE\_ADDRESS then you want to do a swap!\
\
manifest:

```
CALL_METHOD 
    Address("{YOUR_ACCOUNT_ADDRESS}") 
    "withdraw" 
    Address("resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9")
    Decimal("{AMOUNT_OF_FLOOP}");
        
TAKE_FROM_WORKTOP
    Address("resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9") 
    Decimal("{AMOUNT_OF_FLOOP}")
    Bucket("my_bucket_of_floop");

CALL_METHOD
    Address("{COMPONENT_ADDRESS_FEE_VAULT}")
    "swap"
    Bucket("my_bucket_of_floop")
    Address("{RESOURCE_ADDRESS}");
        
CALL_METHOD 
    Address("{YOUR_ACCOUNT_ADDRESS}")
    "deposit_batch" 
    Expression("ENTIRE_WORKTOP");
```

## Handy Api Endpoint

To make things a little simpler, we've added an API endpoint where you can see all the resource vaults, their values and the redemptions amounts (FLOOP or CAVIAR) here:

```
https://api-core.caviarnine.com/v1.0/fee_vaults
```

Currently this endpoint is in real time (and we'd like to leave it like that) but if it get's abused we'll cache it every X minutes which would be a shame.


# Overview

Please note this page is under construction! (It's NOT finished yet!)

For the *how-to* docs, please see [this page](/products-floop/lsu-pool/move-stake-and-instant-unstake#instant-unstake).

### What happens?

{% hint style="info" %}
*You send an LSU and you get back XRD instantly!*
{% endhint %}

Note, you will get back LESS XRD than if you unstaked from your validator and waited the 7 days protocol unstaking period.<br>

### How does it work?

Actually it's very simple:

1. When you send the LSU you ADD liquidity to the LSU Pool and get back a LSU-LP token
2. Then in the same (atomic) transaction you sell that LSU-LP token in the LSU-LP/XRD shape liquidity pool, which you can see here: [LSU-LP/XRD Pool](https://www.caviarnine.com/earn/shape-liquidity/pool/component_rdx1cp252c4c3lglccp98a036ngwt5wjmf2zh5sda46la0zy2y2dq0efp9)
3. You receive the XRD

### Won't the XRD run out of the LSU-LP/XRD shape liquidity pool?

So it could, but it's unlikely because of supply and demand and here's why... As more and more people use Instant Unstake the price of LSU-LP/XRD goes lower and lower. At *some point* it starts to become attractive to arbitragers or even plain stakers...\
\
The staker (who wants to stake to a validator) can do the following:&#x20;

1. Swap their XRD for the now cheap LSU-LP tokens
2. Use the LSU-LP and remove liquidity from the LSU Pool and get more LSU than they would have via staking directly

The arbitrager (happy to wait it out for a return)

* Swap their XRD for the now cheap LSU-LP tokens
* Use the LSU-LP and remove liquidity from the LSU Pool and get more LSU than staking
* Unstake the LSU with the validator, wait the 7 days and pocket the yield difference

In fact, this is the 7 day XRD deposit we offer on the [Portfolio](https://www.caviarnine.com/portfolio) page.

<figure><img src="/files/V3TZaOvWfcZcbyf62lpc" alt="" width="205"><figcaption></figcaption></figure>

### So what happens *if* the pool runs out of XRD?

Actually nothing exciting happens really. Just like any supply and demand situation, an asset can run out. So if XRD runs out then:<br>

* There's no XRD left so Instant Unstake becomes unavailable.
* The LSU-LP/XRD LP providers are now 100% holding LSU-LP tokens at the lower price for their range (currently around 0.9850).
  * These LP providers also have MORE LSU-LP tokens (because of the bonding maths)
  * They can go to the LSU Pool, remove liquidity and get MORE LSU back than they started with.
  * Unstake 50% of the LSU (with the validator) and in 7 days end up with more than what they started with...

### Where does the price have to be for LSU-LP/XRD for staking to be interesting?

If the price of LSU-LP/XRD is 0.9900 then a user can spend 99 XRD and get 100 LSU-LP tokens which are always worth at least 100 LSU tokens, which means they've made \~1% in 1 week. Hmm that's 67% APY 😁\
\
You get the idea...

The LP's of this concentrated pool benefit by taking very little risk in exchanging the LSU-LP token back and forth for XRD. It's a win-win for everyone

### Fees for Instant Unstaking:

Given the actions above, we can breakdown the fees:

* Add Liquidity to LSUPool with LSU resource : Fee = 0
* Sell LSU-LP token for XRD in the ShapeLiquidity Pool : Fee currently 0.30%


# API

API details are under construction


# CoinMarketCap

Api for CoinMarketCap

#### Pools

<mark style="color:blue;">`GET`</mark> `https://api-core.caviarnine.com/v1.0/cmc/pools`

The /pools endpoint provides 24-hour pricing and volume information on each market pair available in pools on CaviarNine.


# CoinGecko

Api for CoinGecko

#### Tickers

<mark style="color:blue;">`GET`</mark> `https://api-core.caviarnine.com/v1.0/cg/tickers`

The /tickers endpoint provides 24-hour pricing and volume information on each market pair available on CaviarNine.

#### Pairs

<mark style="color:blue;">`GET`</mark> `https://api-core.caviarnine.com/v1.0/cg/pairs`

The /tickers endpoint returns active pairs and components on CaviarNine

#### Order Book

<mark style="color:blue;">`GET`</mark> `https://api-core.caviarnine.com/v1.0/cg/orderbook`

Returns the orderbook to a particular depth for a pair of resources.

eg \
[`https://api-core.caviarnine.com/v1.0/cg/orderbook?ticker_id=resource_rdx1tkk83magp3gjyxrpskfsqwkg4g949rmcjee4tu2xmw93ltw2cz94sq-resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd&depth=100`](https://api-core.caviarnine.com/v1.0/cg/orderbook?ticker_id=resource_rdx1tkk83magp3gjyxrpskfsqwkg4g949rmcjee4tu2xmw93ltw2cz94sq-resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd\&depth=100)

#### Path Parameters

| Name                                         | Type   | Description                 |
| -------------------------------------------- | ------ | --------------------------- |
| ticker\_id<mark style="color:red;">\*</mark> | String | `<resource1> - <resource2>` |
| depth                                        | String | `50`                        |


# Public

A set of apis for public use

## Base URL address:

`https://api.caviarnine.com`

## CaviarNine Aggregator

The aggregator at CaviarNine enables a significant proportion of the web2 information and functionality you see at caviarnine.com today. But firstly the disclaimer... \
\
**CaviarNine Aggregator Public Endpoint Disclaimer**

The CaviarNine Aggregator provides a public endpoint for requesting Radix trading manifests, delivering near-optimal routing instructions based on current data. This service is offered on an *as-is* and *as-available* basis without any warranties, guarantees, or representations of accuracy, reliability, or suitability for any particular purpose. While we strive to provide efficient routing information, external factors and inherent data limitations may impact the service's performance and output.

Currently, this endpoint is available free of charge as a public resource. Usage is subject to a rate limit of **5 requests per minute**. CaviarNine Limited reserves the right to introduce fees, modify, restrict, or terminate access to this endpoint without prior notice. By using this service, you acknowledge and accept these terms, agreeing that CaviarNine Limited will not be held liable for any direct or indirect losses resulting from its use.

All routing instructions and data provided through this service are the intellectual property of **CaviarNine Limited** and are intended solely for informational purposes. Redistribution or commercial use without prior written consent from CaviarNine Limited is prohibited.

Users are advised to consider the security of their requests, as publicly accessible services may be susceptible to third-party interception or misuse. Additionally, the functionality and output of this endpoint may evolve to accommodate user needs, regulatory requirements, or technological advancements.<br>

### Resources

<mark style="color:green;">`GET`</mark> `/v1.0/aggregator/resources`

Available resources that the aggregator has seen in the past and are possible to be able to swap. This does not mean there is a guaranteed swap available for the resource\_address

**Response**

{% tabs %}
{% tab title="200" %}

```json
{
  "count": 629,
  "data": [
    "resource_rdx1t40290x6mh42j53lehs56kk2erv6em3cd5jp4hxt2pu8nf2rcknthy",
    "resource_rdx1t40gu7xfffcc723ylrfq7gw7g94v9qjsq7e49ue8r07afz0q2v4qjx",
    ...
    ],
  "utc_now": "2024-11-06T09:46:59.885183"
}
```

{% endtab %}

{% tab title="400" %}

```json
{
  "error": "Invalid request"
}
```

{% endtab %}
{% endtabs %}

### Solve & SolverStream

<mark style="color:green;">`GET`</mark> `/v1.0/aggregator/solve`

<mark style="color:green;">`GET`</mark> `/v1.0/aggregator/solver_stream`

#### Query Parameters

* `sell_resource_amount` (required): Specifies the amount of the resource to sell.
* `sell_resource_address` (required): Specifies the address of the resource to sell.
* `buy_resource_address` (required): Specifies the address of the resource to buy.
* `account_address` (optional): Provides the address of the account making the transaction. If not provided, the response will not include a transaction manifest.

The `/v1.0/aggregator/solve` and `/v1.0/aggregator/solver_stream` endpoints provide near-optimal manifest routes within the Radix ecosystem, leveraging internal mappings and available liquidity to determine the best transaction paths.

#### Functionality Overview

The `/solve` endpoint is designed to provide the best available solution by continuously refining its calculations. This endpoint waits up to 1 second for any additional improvements; if no further optimisations are found within that time, it returns the best price identified so far. This behaviour allows for a responsive solution without excessive delay, delivering near-optimal routes based on the available liquidity in the Radix ecosystem.

In contrast, the `/solver_stream` endpoint is an HTTP2 connection that streams progressive solutions over a 10-second session and then maintains the connection for a further 20-30 seconds giving updates on the best manifest found. With each update, it returns increasingly optimised routes, allowing users to see the improvement in real-time and possibly a better final solution than the /solve endpoint.

#### Additional Notes:

If an `account_address` is provided, the response will include a transaction manifest, which has been simulated at a Radix gateway. The response’s `result` field summarises the key details from the simulation.

Both endpoints serve as powerful tools for efficient, liquidity-optimised transaction routing on the Radix network.

#### Example Query:

`https://api.caviarnine.com/v1.0/aggregator/solve?sell_resource_amount=100&sell_resource_address=resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd&buy_resource_address=resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf&account_address=account_rdx129m63lnnexyt90wpw6nkmshlhlvrp3gvry5f3usth2xnktev8qf2na`

#### Example Response:

{% tabs %}
{% tab title="200" %}
{% code fullWidth="true" %}

```json
{
    "event_type": "SolutionUpdate",
    "manifest": '\n            CALL_METHOD\n                Address("account_rdx129m63lnnexyt90wpw6nkmshlhlvrp3gvry5f3usth2xnktev8qf2na")\n                "withdraw"\n                Address("resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd")\n                Decimal("100");\n            \n            TAKE_FROM_WORKTOP\n                Address("resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd") \n                Decimal("2.993684696191894367") \n                Bucket("fe647ac3");\n            \n            CALL_METHOD \n                Address("component_rdx1cz22qr3f2algcsedqw93lkjqa09xhx746wfgzvq8c8ss6tjlr9p05k") \n                "swap" \n                Bucket("fe647ac3");\n        \n            TAKE_FROM_WORKTOP\n                Address("resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd") \n                Decimal("23.889404161552992178") \n                Bucket("2238054d");\n            \n            CALL_METHOD \n                Address("component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g") \n                "swap" \n                Bucket("2238054d");\n        \n            TAKE_ALL_FROM_WORKTOP\n                Address("resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd") \n                Bucket("8c30932a");\n            \n            CALL_METHOD \n                Address("component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f") \n                "swap" \n                Bucket("8c30932a");\n        \n            TAKE_ALL_FROM_WORKTOP\n                Address("resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww") \n                Bucket("75da929e");\n            \n            CALL_METHOD \n                Address("component_rdx1cpvngcr2xujqz2tysxsft4th00wttpluhndxuh0rcpzdwq5uzj6n6l") \n                "swap" \n                Bucket("75da929e");\n        \n            TAKE_ALL_FROM_WORKTOP\n                Address("resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw") \n                Bucket("f789d984");\n            \n            CALL_METHOD \n                Address("component_rdx1czh7n0v8qs3req4la3stuuxdyhq3trn4r9hwh5jrjjmr3prexsl5sl") \n                "swap" \n                Bucket("f789d984");\n        \n            CALL_METHOD\n                Address("account_rdx129m63lnnexyt90wpw6nkmshlhlvrp3gvry5f3usth2xnktev8qf2na") \n                "deposit_batch"\n                Expression("ENTIRE_WORKTOP");\n        ',
    "payload": {
        "account_address": "account_rdx129m63lnnexyt90wpw6nkmshlhlvrp3gvry5f3usth2xnktev8qf2na",
        "buy_resource_address": "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
        "sell_resource_address": "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
        "sell_resource_amount": "100",
    },
    "result": {
        "account_address": "account_rdx129m63lnnexyt90wpw6nkmshlhlvrp3gvry5f3usth2xnktev8qf2na",
        "balance_changes": {
            "DepositEvent": {"resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf": "1.590187"},
            "WithdrawEvent": {"resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd": "100"},
        },
        "details": {
            "buy_resource_address": "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
            "mid_price_buy_to_sell": "62.896472",
            "mid_price_sell_to_buy": "0.0158977",
            "price_buy_to_sell": "62.885685",
            "price_sell_to_buy": "0.0159018",
            "sell_resource_address": "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
        },
        "error_message": null,
        "fee_summary": {
            "execution_cost_units_consumed": 43787044,
            "finalization_cost_units_consumed": 2776485,
            "xrd_total_execution_cost": "2.1893522",
            "xrd_total_finalization_cost": "0.13882425",
            "xrd_total_royalty_cost": "0",
            "xrd_total_storage_cost": "0.44670104212",
            "xrd_total_tipping_cost": "0",
        },
        "header": {"date_time": "2024-11-07T05:19:29.435Z", "state_version": 161613973, "unix_timestamp_ms": 1730956769435},
        "status": "Succeeded",
    },
    "solver_id": "bb3eaf73-4bf9-4528-b724-543ec491ce5f",
}
```

{% endcode %}
{% endtab %}
{% endtabs %}

## Old API endpoints:

#### Tokens

<mark style="color:blue;">`GET`</mark> `https://api-core.caviarnine.com/v1.0/public/tokens`

returns the resource\_address to xrd price (mid, bid and ask if available) derived from the prices available on Radix


# iFrame Trading Widget

Integrate our stylish trading widget into your website with the simple code snippet below

Simply add the below iFrame code snippet to your website and your users will always be able to trade on Radix!

```html
<iframe
    src="https://www.caviarnine.com/embed/trade"
    width="467px"
    height="544px"
    frameBorder="0" 
/>
```

## iFrame Styles

<figure><img src="/files/vKXIzgZ95X1EikgiqbHY" alt=""><figcaption><p>C9 light and dark mode</p></figcaption></figure>

Currently we have 2 styles, which can be set with a queryStringParameter&#x20;

1. c9\_dark01 \[default]
2. c9\_light01

Example:

```html
<iframe
    src="https://www.caviarnine.com/embed/trade?style=c9_light01"
    width="467px"
    height="544px"
    frameBorder="0" 
/>
```

## Default Starting Resources

If you would like to preset the iFrame widget with two tokens of your choice that CaviarNine support you can pass their resource\_address(es) in as part of the query string.

```
sell_resource=
buy_resource=
```

```html
<iframe
    src="https://www.caviarnine.com/embed/trade?sell_resource=resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8&buy_resource=resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9"
    width="467px"
    height="544px"
    frameBorder="0" 
/>
```

## Radix Connector Browser Extension

To let your Radix Wallet connect to the iFrame in your websites, you’ll need to download the Radix Connector browser extension. You can find the details about that here... <https://wallet.radixdlt.com/>\
\ <br>


