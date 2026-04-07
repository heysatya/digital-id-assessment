// File: src/data/questions.ts
import { Question } from '../types';

const rawQuestions = [
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.1 Legal Authority & Civil Registration Linkage",
    "question": "How comprehensive is the legal authority and scope of the Trident system?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.1 Legal Authority & Civil Registration Linkage",
    "question": "Is Trident legally linked to the civil registration system as the foundational identity source?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.1 Legal Authority & Civil Registration Linkage",
    "question": "Does the law explicitly prohibit the mandatory use of Trident for essential public services?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.2 Data Protection, Privacy & Consent Law",
    "question": "How strong is the national data protection law governing Trident data processing?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.2 Data Protection, Privacy & Consent Law",
    "question": "Are Data Protection Impact Assessments (DPIAs) legally mandated before Trident rollouts?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.2 Data Protection, Privacy & Consent Law",
    "question": "Do individuals have enforceable legal rights to access, correct, and delete their Trident data?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.3 Cybersecurity & Digital Trust Legal Framework",
    "question": "How effective is the cybersecurity law protecting Trident as critical national infrastructure?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.3 Cybersecurity & Digital Trust Legal Framework",
    "question": "Does the law mandate data breach notification to regulators and users within defined timeframes?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.4 Digital Signature, Trust Services & AI Law", "question": "How comprehensive is the legal framework governing digital signatures and automated decision-making?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.4 Digital Signature, Trust Services & AI Law",
    "question": "Are there active legal safeguards for automated decision-making using Trident data?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.5 Impact Assessment Obligations",
    "question": "How comprehensive are the legal obligations for impact assessments during the Trident lifecycle?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.5 Impact Assessment Obligations",
    "question": "Was an independently reviewed human rights impact assessment legally mandated before deployment?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.6 Cross-Border Data Sharing & Interoperability Law",
    "question": "How strong is the legal framework governing cross-border transfers of Trident data?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P1 · Legal & Regulatory Foundations",
    "subpillar": "1.6 Cross-Border Data Sharing & Interoperability Law",
    "question": "Are relying parties legally required to register their Trident use cases in a public registry?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.1 Lead Agency Mandate, Independence & Resourcing",
    "question": "How strong is the organizational independence, mandate, and resourcing of the lead agency?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.1 Lead Agency Mandate, Independence & Resourcing",
    "question": "Does the lead agency possess sufficient qualified technical, legal, and privacy staff?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "NONE"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.2 Inter-Agency Coordination & Development Partner Management",
    "question": "How effective is inter-agency coordination and partner management for the Trident system?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "NONE"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.2 Inter-Agency Coordination & Development Partner Management",
    "question": "Are civil society and marginalized groups formally represented in the Trident governance body?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.3 Procurement Integrity & Anti-Corruption",
    "question": "How strong are the procurement integrity and anti-corruption frameworks for Trident contracts?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.3 Procurement Integrity & Anti-Corruption",
    "question": "Is an actively enforced anti-corruption framework in place for all Trident-related contracts?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.4 Administrative Review, Appeal & Grievance Redress",
    "question": "How effective is the legally binding grievance redress mechanism for Trident users?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.4 Administrative Review, Appeal & Grievance Redress",
    "question": "What percentage of Trident grievances are resolved to the complainant's satisfaction?",
    "responseType": "percentage",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.5 Independent & Judicial Oversight",
    "question": "How strong is the independent and judicial oversight of the Trident system?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.5 Independent & Judicial Oversight",
    "question": "Does an independent oversight body have a formal mandate to audit Trident?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.6 Sustainability & Financing Model",
    "question": "How strong is the multi-year financing and sustainability model for Trident operations?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P2 · Institutional Governance & Accountability",
    "subpillar": "2.6 Sustainability & Financing Model",
    "question": "Does a formal DPI sustainability plan exist with targets for technological refresh?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "NONE"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.1 ID System Architecture & Design Principles",
    "question": "How effective is the architectural design and modularity of the Trident system?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.1 ID System Architecture & Design Principles",
    "question": "Does Trident utilize federated or decentralized infrastructure to reduce single-point-of-failure risks?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "NONE"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.2 Interoperability, Open Standards & APIs",
    "question": "How comprehensive is Trident's use of open standards and documented interoperability protocols?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.2 Interoperability, Open Standards & APIs",
    "question": "Does Trident expose accessible, documented open APIs for authorized relying parties?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.3 DPI Stack Integration",
    "question": "How comprehensive is Trident's integration across the national DPI and government services?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.3 DPI Stack Integration",
    "question": "Is Trident interoperable with other national DPI components through tested integration points?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "NONE"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.4 Cybersecurity Architecture, Resilience & Incident Response",
    "question": "How strong is the cybersecurity architecture, resilience, and incident response of Trident?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.4 Cybersecurity Architecture, Resilience & Incident Response",
    "question": "Has a documented incident response plan been tested in the past 12 months?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.5 Privacy-by-Design & Data Minimisation (Technical)",
    "question": "How effective are the privacy-by-design and data minimization controls within Trident's architecture?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.5 Privacy-by-Design & Data Minimisation (Technical)",
    "question": "Are automated PII deletion mechanisms implemented and verified through technical audits?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.6 Biometric & Credential Management",
    "question": "How strong are the biometric controls and credential lifecycle management processes in Trident?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P3 · Technical Architecture & Security",
    "subpillar": "3.6 Biometric & Credential Management",
    "question": "If biometrics are collected, do non-biometric alternative enrollment pathways exist?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.1 Universal Enrollment & Non-Discrimination",
    "question": "How comprehensive and non-discriminatory is the universal enrollment process for Trident?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.1 Universal Enrollment & Non-Discrimination",
    "question": "Does the enrollment process provide alternative pathways for individuals without standard documentation?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.1 Universal Enrollment & Non-Discrimination",
    "question": "Can women register independently without requiring family or male guardian consent?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.2 Accessibility, User Experience & Multi-Channel Access",
    "question": "How effective is the accessibility and user experience of Trident across multiple channels?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.2 Accessibility, User Experience & Multi-Channel Access",
    "question": "Does the Trident user interface comply with WCAG 2.1 AA accessibility standards?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.3 Integration into Government & Private Sector Services",
    "question": "How strong is the integration of Trident into essential government and private services?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.3 Integration into Government & Private Sector Services",
    "question": "Are multiple private sector services formally integrating Trident under a regulated framework?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "PRI",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.4 Active Outreach, Awareness & Last-Mile Enrollment",
    "question": "How effective are the outreach and awareness campaigns for last-mile Trident enrollment?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.4 Active Outreach, Awareness & Last-Mile Enrollment",
    "question": "Are active outreach programs targeting last-mile and vulnerable populations fully operational?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.5 User Data Rights, Consent & Autonomy in Practice",
    "question": "How strong are user data rights, consent mechanisms, and autonomy in practical application?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.5 User Data Rights, Consent & Autonomy in Practice",
    "question": "Can users independently revoke specific data consent without losing access to essential services?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.6 Feedback Loops, Monitoring & Service Improvement",
    "question": "How effective are the feedback loops and monitoring mechanisms for Trident service improvement?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P4 · Inclusion, Access & User Value",
    "subpillar": "4.6 Feedback Loops, Monitoring & Service Improvement",
    "question": "Is Trident usage data disaggregated by gender, ability, and age for monitoring purposes?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.1 Civil Society & Community Participation",
    "question": "How strong is civil society and community participation in Trident design and governance?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "CIV",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.1 Civil Society & Community Participation",
    "question": "Does a formal whistleblower channel exist with established anonymity protections?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.2 Legislative Oversight",
    "question": "How effective is the legislative oversight and parliamentary scrutiny of the Trident system?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.2 Legislative Oversight",
    "question": "Does a parliamentary committee have a formal mandate to review Trident compliance and budgets?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.3 Transparency, Access to Information & Public Reporting",
    "question": "How strong is the transparency and public reporting of Trident operations and governance?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.3 Transparency, Access to Information & Public Reporting",
    "question": "Is a publicly accessible repository available for Trident architecture, audit reports, and policies?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.4 Media Freedom & External Scrutiny",
    "question": "How effective is external scrutiny and media access regarding Trident performance and governance?",
    "responseType": "likert",
    "weight": 3,
    "primaryStakeholder": "CIV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.4 Media Freedom & External Scrutiny",
    "question": "Are human rights impact assessment reports for Trident publicly accessible and easily understandable?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "CIV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.5 Digital Trust, Public Awareness & Adoption",
    "question": "How strong is public digital trust and adoption of the Trident system?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  },
  {
    "pillar": "P5 · Participation, Transparency & Public Trust",
    "subpillar": "5.5 Digital Trust, Public Awareness & Adoption",
    "question": "What percentage of the population reports trusting Trident to protect their personal data?",
    "responseType": "percentage",
    "weight": 3,
    "primaryStakeholder": "CIV",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.1 Private Sector Participation & Market Dynamics",
    "question": "How effective are the policies managing private sector participation and market dynamics for Trident?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "PRI",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.1 Private Sector Participation & Market Dynamics",
    "question": "Are enforced policies in place to prevent market monopolization by a single technology provider?",
    "responseType": "yes_no",
    "weight": 3,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.2 Developer Ecosystem, Sandboxes & Innovation Enablement",
    "question": "How strong is the enablement of third-party innovation through Trident developer ecosystems?",
    "responseType": "likert",
    "weight": 1,
    "primaryStakeholder": "PRI",
    "secondaryStakeholder": "GOV"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.2 Developer Ecosystem, Sandboxes & Innovation Enablement",
    "question": "Does a publicly accessible developer sandbox exist to enable third-party integration and testing?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.3 Standards, Certification & Conformance",
    "question": "How comprehensive are the standards, certification, and conformance testing programs for Trident?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.3 Standards, Certification & Conformance",
    "question": "Does a formal conformance testing program exist for relying parties integrating with Trident?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "REG",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.4 Regional & Cross-Border Interoperability (Operational)",
    "question": "How effective is Trident's operational interoperability within regional and cross-border trust frameworks?",
    "responseType": "likert",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.4 Regional & Cross-Border Interoperability (Operational)",
    "question": "Are cross-border authentication transactions using Trident operationally tested against defined security benchmarks?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "PRI"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.5 Environmental Sustainability",
    "question": "How strong are the environmental sustainability practices governing Trident operations and hardware?",
    "responseType": "likert",
    "weight": 1,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "REG"
  },
  {
    "pillar": "P6 · Ecosystem, Market & Sustainability",
    "subpillar": "6.5 Environmental Sustainability",
    "question": "Was a comprehensive environmental impact assessment conducted and published during the Trident rollout?",
    "responseType": "yes_no",
    "weight": 2,
    "primaryStakeholder": "GOV",
    "secondaryStakeholder": "CIV"
  }
];

export const questions: Question[] = rawQuestions.map((q, index) => {
  let anchors: any[] = [];
  
  if (q.responseType === 'likert') {
    if (q.pillar.startsWith('P1')) {
      anchors = [
        { value: '0', label: '0', description: 'No legal framework exists' },
        { value: '1', label: '1', description: 'Draft legislation under development or review' },
        { value: '2', label: '2', description: 'Legislation enacted but not yet operational' },
        { value: '3', label: '3', description: 'Legislation operational but with implementation gaps or limited enforcement' },
        { value: '4', label: '4', description: 'Fully operational with effective oversight' }
      ];
    } else {
      anchors = [
        { value: '0', label: '0', description: 'Not at all - No evidence' },
        { value: '1', label: '1', description: 'Minimally - Very limited evidence' },
        { value: '2', label: '2', description: 'Partially - Some evidence, inconsistent' },
        { value: '3', label: '3', description: 'Substantially - Strong evidence, implemented' },
        { value: '4', label: '4', description: 'Completely - Comprehensive evidence, fully effective' }
      ];
    }
  } else if (q.responseType === 'yes_no') {
    anchors = [
      { value: '4', label: 'Yes, fully implemented', description: 'Requirement completely met, comprehensive evidence' },
      { value: '3', label: 'Yes, partially', description: 'Requirement largely met, some gaps or exceptions' },
      { value: '1', label: 'No, but planned', description: 'Work underway, timeline established' },
      { value: '0', label: 'No', description: 'Requirement not met, no plans to address' },
      { value: 'not_sure', label: 'Not sure', description: 'Insufficient information to determine' }
    ];
  } else if (q.responseType === 'percentage') {
    anchors = [
      { value: '0', label: '< 20%', description: 'Minimal reach, early rollout only' },
      { value: '1', label: '20-40%', description: 'Limited coverage, selected demographics' },
      { value: '2', label: '40-60%', description: 'Moderate coverage, expanding' },
      { value: '3', label: '60-80%', description: 'Substantial coverage, most regions' },
      { value: '4', label: '80-100%', description: 'Comprehensive coverage, universal' }
    ];
  }

  return {
    ...q,
    id: index,
    responseType: q.responseType as 'likert' | 'yes_no' | 'percentage',
    anchors,
  };
});

export const groupedByPillar = questions.reduce((acc, question) => {
  if (!acc[question.pillar]) acc[question.pillar] = {};
  if (!acc[question.pillar][question.subpillar]) acc[question.pillar][question.subpillar] = [];
  acc[question.pillar][question.subpillar].push(question);
  return acc;
}, {} as Record<string, Record<string, Question[]>>);

export const pillars = Object.keys(groupedByPillar);