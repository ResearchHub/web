import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';
import { Bounty, BountyType, transformBounty } from '@/types/bounty';
import { transformUser } from '@/types/user';
import { transformAuthorProfile } from '@/types/authorProfile';
import { Fundraise, transformFundraise } from '@/types/funding';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';
  private static readonly FUNDING_PATH = '/api/funding_feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feedView?: string;
    hubSlug?: string;
    contentType?: string;
    source?: 'all' | 'researchhub';
    endpoint?: 'feed' | 'funding_feed';
    fundraiseStatus?: 'OPEN' | 'CLOSED';
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feedView) queryParams.append('feed_view', params.feedView);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);
    if (params?.contentType) queryParams.append('content_type', params.contentType);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.fundraiseStatus) queryParams.append('fundraise_status', params.fundraiseStatus);

    // Determine which endpoint to use
    const basePath = params?.endpoint === 'funding_feed' ? this.FUNDING_PATH : this.BASE_PATH;
    const url = `${basePath}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      // Use ApiClient for both server and client environments
      const isServer = typeof window === 'undefined';
      console.log(`Fetching feed from URL: ${url} (${isServer ? 'server-side' : 'client-side'})`);

      const response = await ApiClient.get<FeedApiResponse>(url);

      // const response = {
      //   count: 60898,
      //   next: 'https://backend.prod.researchhub.com/api/feed/?feed_view=popular&page=2&page_size=20&source=all',
      //   previous: null,
      //   results: [
      //     {
      //       id: 1784651,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348017,
      //         doi: '10.1101/2025.04.01.646636',
      //         hub: null,
      //         slug: 'the-molecular-chaperone-trap1-promotes-translation-ofiluc7i3imrna-to-enhance-ovarian-cancer-cell-proliferation',
      //         title:
      //           'The molecular chaperone TRAP1 promotes translation of<i>Luc7I3</i>mRNA to enhance ovarian cancer cell proliferation',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           'ABSTRACT Heat shock proteins have been increasingly identified in RNA-interactomes, suggesting potential roles beyond their canonical functions. Among those, the cancer-linked chaperone TRAP1 has been mainly characterized for its regulatory role on respiratory complex activity and protein synthesis, while its specific function as an RNA-binding protein (RBP) remains unclear. In this study, we confirmed the RNA-binding activity of TRAP1 in living cells using both protein- and RNA-centric approaches and demonstrated that multiple TRAP1 regions cooperate in such binding. Enhanced cross-linking and immunoprecipitation (eCLIP) in high-grade serous ovarian cancer cells revealed that TRAP1 primarily binds cytosolic protein-coding genes, with the majority coding for splicing-related factors. Notably, among TRAP1 most significantly bound transcripts, we identified the splicing factor LUC7L3, a U1 snRNP component involved in cell proliferation. We confirmed TRAP1 binding to Luc7l3 transcript by RIP-qPCR and showed that TRAP1 promotes Luc7l3 mRNA translation. Furthermore, we demonstrated that TRAP1 enhances ovarian cancer cell proliferation through LUC7L3 translational regulation. In summary, our findings provide the first comprehensive characterization of TRAP1 as an RBP and identify a critical target for ovarian cancer cell proliferation, offering new insights into its multifaceted roles in tumor biology.',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'De Lella',
      //             first_name: 'Sabrina',
      //           },
      //           {
      //             last_name: 'Pedalino',
      //             first_name: 'Lorenza',
      //           },
      //           {
      //             last_name: 'Almagboul Abdalla Abaker',
      //             first_name: 'Mehad',
      //           },
      //           {
      //             last_name: 'Mignogna',
      //             first_name: 'Chiara',
      //           },
      //           {
      //             last_name: 'Cautiero',
      //             first_name: 'Raffaele',
      //           },
      //           {
      //             last_name: 'Esposito',
      //             first_name: 'Franca',
      //           },
      //           {
      //             last_name: 'Matassa',
      //             first_name: 'Danilo Swann',
      //           },
      //           {
      //             last_name: 'Avolio',
      //             first_name: 'Rosario',
      //           },
      //         ],
      //         created_date: '2025-04-06T20:36:28.902067Z',
      //       },
      //       created_date: '2025-04-06T20:39:12.091805Z',
      //       action_date: '2025-04-03T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784649,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348016,
      //         doi: '10.1101/2025.04.01.646152',
      //         hub: null,
      //         slug: 'the-immune-modulatory-function-of-megakaryocytes-in-the-hematopoietic-niche-of-myeloproliferative-neoplasms',
      //         title:
      //           'The Immune-Modulatory Function of Megakaryocytes in the Hematopoietic Niche of Myeloproliferative Neoplasms',
      //         authors: [],
      //         journal: {
      //           id: 581030,
      //           name: 'Cancer Research',
      //           slug: 'cancer-research-1',
      //           image: null,
      //           description: '',
      //         },
      //         abstract:
      //           'Abstract Myeloproliferative neoplasms (MPNs) are clonal stem cell disorders characterized by dysregulated megakaryopoiesis and neoplastic hematopoietic stem cell (HSC) expansion. Using a murine model with MK-specific JAK2V617F expression, we establish an MPN aging model where mutant MKs drive HSC expansion and a progressive decline in wild-type HSC function. Compared to wild-type MKs, JAK2V617F MKs exhibit heightened inflammation and innate immune activation with aging, including increased antigen presentation, elevated pro-inflammatory cytokines, skewed T cell populations, and impaired T cell functions in the marrow niche. Enhanced MK immunomodulatory function is linked to mutant cell expansion and MPN progression in a chimeric murine model with co-existing wild-type and JAK2V617F mutant HSCs. LINE-1 (long-interspersed element-1), a retrotransposon linked to innate immune activation and aging, is upregulated in mutant MKs during aging in murine models. We validated that LINE-1–encoded protein ORF1p is expressed in marrow MKs in 12 of 13 MPN patients but absent in control samples from patients undergoing orthopedic surgery (n=5). These findings suggest that MKs reprogram the marrow immune microenvironment, impairing normal HSC function while promoting neoplastic expansion in MPNs. LINE-1 activation in mutant MKs may be a key driver of immune dysregulation in MPNs. Key Points JAK2V617F mutant MKs reprogram the marrow immune microenvironment to promote neoplastic HSC expansion in MPNs. LINE-1 activation in diseased MKs triggers chronic inflammation and immune dysfunction in MPNs.',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Lee',
      //             first_name: 'Sandy',
      //           },
      //           {
      //             last_name: 'Yang',
      //             first_name: 'Xiaoxi',
      //           },
      //           {
      //             last_name: 'Masarik',
      //             first_name: 'Kyla',
      //           },
      //           {
      //             last_name: 'Ahmed',
      //             first_name: 'Tameena',
      //           },
      //           {
      //             last_name: 'Zheng',
      //             first_name: 'Lei',
      //           },
      //           {
      //             last_name: 'Zhan',
      //             first_name: 'Huichun',
      //           },
      //         ],
      //         created_date: '2025-04-06T20:34:46.323936Z',
      //       },
      //       created_date: '2025-04-06T20:37:22.548598Z',
      //       action_date: '2025-04-03T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784647,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348015,
      //         doi: '10.1101/2025.04.01.646644',
      //         hub: null,
      //         slug: 'hdl-nanodiscs-loaded-with-liver-x-receptor-agonist-decreases-tumor-burden-and-mediates-long-term-survival-in-mouse-glioma-model',
      //         title:
      //           'HDL Nanodiscs Loaded with Liver X Receptor Agonist Decreases Tumor Burden and Mediates Long-term Survival in Mouse Glioma Model',
      //         authors: [],
      //         journal: {
      //           id: 581030,
      //           name: 'Cancer Research',
      //           slug: 'cancer-research-1',
      //           image: null,
      //           description: '',
      //         },
      //         abstract:
      //           'Abstract Glioblastoma multiforme (GBM) is highly aggressive primary brain tumor with a 5-year survival rate of 7%. Previous studies have shown that GBM tumors have a reduced capacity to produce cholesterol and instead depend on the uptake of cholesterol produced by astrocytes. To target cholesterol metabolism to induce cancer cell death, synthetic high-density lipoprotein (sHDL) nanodiscs delivering Liver-X-Receptor (LXR) agonists and CpG oligonucleotides for targeting GBM were investigated. LXR agonists synergize with sHDL nanodiscs by increasing the expression of the ABCA1 cholesterol CpG oligonucleotides are established adjuvants used in cancer immunotherapy that work through the toll-like receptor 9 pathway. In the present study, treatment with GW-CpG-sHDL nanodiscs increased the expression of cholesterol efflux transporters on murine GL261 cells leading to enhanced cholesterol removal. Experiments in GL261-tumor-bearing mice revealed combining GW-CpG-sHDL nanodiscs with radiation (IR) therapy significantly increases median survival compared to GW-CpG-sHDL or IR alone. Furthermore, 66% of long-term survivors from the GW-CpG-sHDL +IR treatment group showed no tumor tissue when rechallenged.',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Halseth',
      //             first_name: 'Troy A.',
      //           },
      //           {
      //             last_name: 'Mujeeb',
      //             first_name: 'Anzar A.',
      //           },
      //           {
      //             last_name: 'Liu',
      //             first_name: 'Lisha',
      //           },
      //           {
      //             last_name: 'Banerjee',
      //             first_name: 'Kaushik',
      //           },
      //           {
      //             last_name: 'Lang',
      //             first_name: 'Nigel',
      //           },
      //           {
      //             last_name: 'Hollon',
      //             first_name: 'Todd',
      //           },
      //           {
      //             last_name: 'Yu',
      //             first_name: 'Minzhi',
      //           },
      //           {
      //             last_name: 'Roest',
      //             first_name: 'Mark Vander',
      //           },
      //           {
      //             last_name: 'Mei',
      //             first_name: 'Ling',
      //           },
      //           {
      //             last_name: 'He',
      //             first_name: 'Hongliang',
      //           },
      //           {
      //             last_name: 'Sheth',
      //             first_name: 'Maya',
      //           },
      //           {
      //             last_name: 'Castro',
      //             first_name: 'Maria G.',
      //           },
      //           {
      //             last_name: 'Schwendeman',
      //             first_name: 'Anna',
      //           },
      //         ],
      //         created_date: '2025-04-06T20:33:39.118263Z',
      //       },
      //       created_date: '2025-04-06T20:34:16.832432Z',
      //       action_date: '2025-04-03T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784645,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348014,
      //         doi: '10.1101/2025.04.02.646822',
      //         hub: null,
      //         slug: 'epitope-expression-persists-in-circulating-tumor-cells-as-breast-cancers-acquire-resistance-to-antibody-drug-conjugates',
      //         title:
      //           'Epitope Expression Persists in Circulating Tumor Cells as Breast Cancers Acquire Resistance to Antibody Drug Conjugates',
      //         authors: [],
      //         journal: {
      //           id: 581030,
      //           name: 'Cancer Research',
      //           slug: 'cancer-research-1',
      //           image: null,
      //           description: '',
      //         },
      //         abstract:
      //           'Antibody-drug conjugates (ADCs) targeting cell surface proteins TROP2 or HER2 are effective in metastatic breast cancer, but the precise clinical contribution of epitope expression is uncertain. We prospectively monitored circulating tumor cells (CTCs) in 33 patients receiving ADC therapies using quantitative imaging. The expression of TROP2 and HER2 are heterogeneous across single CTCs from untreated patients, comparable to matched tumor biopsies, and display poor association with clinical response. Within three weeks of treatment initiation, declining CTC numbers correlate with a durable response (TROP2: median time to progression 391 versus 97 days, HR 4.15, P=0.0046; HER2: 322 versus 66 days, HR 9.12, P=0.0002). Neither TROP2 nor HER2 expression is reduced at progression, compared to matched pretreatment CTCs, and switching ADC epitope while maintaining a similar payload shows poor efficacy. Thus, epitope downregulation is not a common driver of acquired resistance to TROP2 or HER2 ADCs, and second-line ADC therapies may benefit from distinct payloads.',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Mishra',
      //             first_name: 'Avanish',
      //           },
      //           {
      //             last_name: 'Abelman',
      //             first_name: 'Rachel',
      //           },
      //           {
      //             last_name: 'Cunneely',
      //             first_name: 'Quinn',
      //           },
      //           {
      //             last_name: 'Putaturo',
      //             first_name: 'Victor',
      //           },
      //           {
      //             last_name: 'Deshpande',
      //             first_name: 'Akansha A.',
      //           },
      //           {
      //             last_name: 'Bell',
      //             first_name: 'Remy',
      //           },
      //           {
      //             last_name: 'Seider',
      //             first_name: 'Elizabeth M.',
      //           },
      //           {
      //             last_name: 'Xu',
      //             first_name: 'Katherine H.',
      //           },
      //           {
      //             last_name: 'Shan',
      //             first_name: 'Mythreayi',
      //           },
      //           {
      //             last_name: 'Kelly',
      //             first_name: 'Justin',
      //           },
      //           {
      //             last_name: 'Huang',
      //             first_name: 'Shih-Bo',
      //           },
      //           {
      //             last_name: 'Gopinathan',
      //             first_name: 'Kaustav A.',
      //           },
      //           {
      //             last_name: 'Kikkeri',
      //             first_name: 'Kruthika',
      //           },
      //           {
      //             last_name: 'Edd',
      //             first_name: 'Jon F.',
      //           },
      //           {
      //             last_name: 'Walsh',
      //             first_name: 'John',
      //           },
      //           {
      //             last_name: 'Dai',
      //             first_name: 'Charles S.',
      //           },
      //           {
      //             last_name: 'Ellisen',
      //             first_name: 'Leif',
      //           },
      //           {
      //             last_name: 'Ting',
      //             first_name: 'David T.',
      //           },
      //           {
      //             last_name: 'Nieman',
      //             first_name: 'Linda',
      //           },
      //           {
      //             last_name: 'Toner',
      //             first_name: 'Mehmet',
      //           },
      //           {
      //             last_name: 'Bardia',
      //             first_name: 'Aditya',
      //           },
      //           {
      //             last_name: 'Haber',
      //             first_name: 'Daniel A.',
      //           },
      //           {
      //             last_name: 'Maheswaran',
      //             first_name: 'Shyamala',
      //           },
      //         ],
      //         created_date: '2025-04-06T20:32:32.018589Z',
      //       },
      //       created_date: '2025-04-06T20:32:53.630371Z',
      //       action_date: '2025-04-03T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1786869,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348178,
      //         doi: '10.1101/2025.03.27.645755',
      //         hub: {
      //           name: 'Physiology',
      //           slug: 'physiology',
      //         },
      //         slug: 'pathological-calcium-influx-through-amyloid-beta-pores-disrupts-synaptic-function',
      //         title:
      //           'Pathological calcium influx through amyloid beta pores disrupts synaptic function',
      //         authors: [
      //           {
      //             id: 1134545,
      //             user: null,
      //             headline: null,
      //             last_name: 'Adeoye',
      //             first_name: 'Temitope',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1134546,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ullah',
      //             first_name: 'Ghanim',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 89030,
      //           name: 'bioRxiv',
      //           slug: 'biorxiv-1',
      //           image: null,
      //           description:
      //             'provides preprints in biological sciences, including subfields like neuroscience, genomics, and physiology, operated by Cold Spring Harbor Laboratory',
      //         },
      //         abstract:
      //           "Alzheimer's disease (AD) is characterized by profound disruption of synaptic function, with mounting evidence suggesting that amyloid-β (Aβ) oligomers disrupt calcium (Ca 2+ ) homeostasis through membrane pore formation. While these pores are known to alter intracellular Ca 2+ dynamics, their immediate impact on synaptic transmission and potential interaction with Familial AD (FAD)-associated endoplasmic reticulum (ER) dysfunction remains unclear. Here, we extend our previously developed model of presynaptic Ca 2+ dynamics to examine how Aβ pore activity alters exocytosis and how such disruptions may manifest in the presence of FAD-associated ER dysfunction. Our model reveals that Aβ pores fundamentally alter both the timing and strength of neurotransmitter release. Unexpectedly, the impact of pores on synaptic function depends critically on their pattern of activity, where continuous pore activity leads to synaptic hyperactivation, while temporally brief periods of intense pore activity trigger lasting hypoactivation at short timescales. These effects manifest most strongly in synapses with low and intermediate release probabilities, highlighting the established selective vulnerability of such synaptic configurations. We find that Aβ pores and FAD-driven ER Ca 2+ dysregulation form an integrated pathological unit through bidirectional coupling of their respective Ca 2+ microdomains to create complex patterns of disruptions. This coupling creates feedback loops that produces an additive effect on neurotransmitter release during brief stimulations, but non-additive effects during sustained activity that promotes a shift towards asynchronous release. Surprisingly, our simulations predict that extended pore activity does not worsen indefinitely but only produces a modest additional disruption beyond initial pore formation that is likely determined by the intrinsic properties of the synapse. These findings indicate that early synaptic dysfunction in AD may arise from subtle perturbations in the temporal coordination of release rather than gross Ca 2+ dysregulation, providing new mechanistic insights into the progressive nature of Aβ-driven synaptic failure in AD.",
      //         bounties: [
      //           {
      //             id: 4242,
      //             hub: {
      //               name: 'Physiology',
      //               slug: 'physiology',
      //             },
      //             amount: '700.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4242,
      //                 amount: 700,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-22T21:47:26.163690Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0002-0890-2581',
      //             countries: [],
      //             last_name: 'Adeoye',
      //             first_name: 'Temitope',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5039533983',
      //             raw_author_name: 'Temitope Adeoye',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-3716-8742',
      //             countries: [],
      //             last_name: 'Ullah',
      //             first_name: 'Ghanim',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5083123719',
      //             raw_author_name: 'Ghanim Ullah',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //         ],
      //         created_date: '2025-04-07T20:26:27.697980Z',
      //       },
      //       created_date: '2025-04-07T20:26:28.572757Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1786714,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348169,
      //         doi: '10.1101/2025.03.27.645832',
      //         hub: {
      //           name: 'Molecular Biology',
      //           slug: 'molecular-biology-1',
      //         },
      //         slug: 'vascular-biomechanics-and-brain-biochemistry-in-aged-and-alzheimers-disease-mouse-models',
      //         title:
      //           "Vascular Biomechanics and Brain Biochemistry in Aged and Alzheimer's Disease Mouse Models",
      //         authors: [
      //           {
      //             id: 3143685,
      //             user: null,
      //             headline: null,
      //             last_name: 'Brown',
      //             first_name: 'Lindsay',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4064138,
      //             user: null,
      //             headline: null,
      //             last_name: 'Schulz',
      //             first_name: 'Kalynn',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4312263,
      //             user: null,
      //             headline: null,
      //             last_name: 'Prosser',
      //             first_name: 'Rebecca',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677942,
      //             user: null,
      //             headline: null,
      //             last_name: 'Jones',
      //             first_name: 'Allison',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677943,
      //             user: null,
      //             headline: null,
      //             last_name: 'Jarrahi',
      //             first_name: 'Amin',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677944,
      //             user: null,
      //             headline: null,
      //             last_name: 'Karpowich',
      //             first_name: 'Kylee',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677945,
      //             user: null,
      //             headline: null,
      //             last_name: 'Crouch',
      //             first_name: 'C.',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 89030,
      //           name: 'bioRxiv',
      //           slug: 'biorxiv-1',
      //           image: null,
      //           description:
      //             'provides preprints in biological sciences, including subfields like neuroscience, genomics, and physiology, operated by Cold Spring Harbor Laboratory',
      //         },
      //         abstract:
      //           "Age-related vascular changes accompany or precede the development of Alzheimer's disease (AD) pathology. The comorbidity of AD and arterial stiffening may suggest that vascular changes have a pathogenic role. Carotid artery mechanics and hemodynamics have been associated with age-related cognitive decline. However, the impact of hemodynamics and vascular mechanics on regional vulnerability within the brain have not been thoroughly explored. Despite the venous system's role in transport, the impact of age-related alterations of the brain venous circulation on cognitive impairment is much less understood compared to the arterial system. By studying vascular mechanics and the resulting spatially-resolved brain lipids in young and aged AD mice, we can determine the relationship between vascular stiffening and brain function. Young and aged female 3xTg mice and age-matched controls were imaged using a combination of ultrasound and mass spectrometry. Wall shear stress varied across age and AD (p&lt;0.05). The circumferential cyclic strain values for the carotid arteries and the WSS values for the jugular veins between groups were measured but were not statistically significant. Both mean velocity and pulsatility index (PI) varied across and age and AD (p&lt;0.05).Liquid chromatography mass spectrometry (LC-MS) of brain tissue identified several lipids and metabolites with statistically significant quantities (p&lt;0.05). The fold change was computed for young AD vs. young control, aged AD vs. aged control, aged control vs. young control, and aged AD vs. young AD. The abundance of several lipid headgroups changed significantly with respect to age and AD. Phosphatidylcholines (PC), phosphatidylethanolamines (PE), cardiolipins (CL), phosphatidylserines (PS), and lysophosphatidylcholines (LPC) have been shown to decrease with AD in previous studies. However, we observed a statistically significant increase in PC, PE, CL, PS, and LPC in the aged 3xTG mouse model compared to aged controls. Hexosylceramides (HexCer), ceramides (CER) and sphingomyelin (SM), classes of sphingolipids; lysophosphatidylethanolamine (LPE), a class of phospholipids; and onogalactosyl diglycerides (MGDG), a class of glycerolipids, have been shown to increase with AD in previous studies which aligns with the statistically significant increase of LPC, HexCer, CER, SM, LPE, and MDG observed in the aged 3xTg group compared to controls in this work. Combining both ultrasound imaging and mass spectrometry, we were able determine significant differences in the vascular biomechanics and brain biochemistry seen with aging and AD.",
      //         bounties: [
      //           {
      //             id: 4243,
      //             hub: {
      //               name: 'Molecular Biology',
      //               slug: 'molecular-biology-1',
      //             },
      //             amount: '700.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4243,
      //                 amount: 700,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-22T21:47:29.952886Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0002-9677-3950',
      //             countries: [],
      //             last_name: 'Jones',
      //             first_name: 'Allison',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5103220940',
      //             raw_author_name: 'Allison Jones',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Jarrahi',
      //             first_name: 'Amin',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5070362992',
      //             raw_author_name: 'Amin Jarrahi',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Karpowich',
      //             first_name: 'Kylee',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5116866225',
      //             raw_author_name: 'Kylee Karpowich',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2790-5112',
      //             countries: [],
      //             last_name: 'Brown',
      //             first_name: 'Lindsay',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5045818602',
      //             raw_author_name: 'Lindsay Brown',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-5001-3721',
      //             countries: [],
      //             last_name: 'Schulz',
      //             first_name: 'Kalynn',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5103685537',
      //             raw_author_name: 'Kalynn M Schulz',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-1636-7272',
      //             countries: [],
      //             last_name: 'Prosser',
      //             first_name: 'Rebecca',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5056966239',
      //             raw_author_name: 'Rebecca A Prosser',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2570-6523',
      //             countries: [],
      //             last_name: 'Crouch',
      //             first_name: 'C.',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5060656959',
      //             raw_author_name: 'Colleen Crouch',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //         ],
      //         created_date: '2025-04-07T20:25:19.125456Z',
      //       },
      //       created_date: '2025-04-07T20:25:19.636131Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1786701,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348168,
      //         doi: '10.1101/2025.03.27.645678',
      //         hub: {
      //           name: 'Neurology',
      //           slug: 'neurology',
      //         },
      //         slug: 'bedside-assessment-of-visual-tracking-in-traumatic-brain-injury-comparing-simple-and-predictive-paradigms-using-multiple-oculomotor-markers',
      //         title:
      //           'Bedside Assessment of Visual Tracking in Traumatic Brain Injury: Comparing Simple and Predictive Paradigms Using Multiple Oculomotor Markers',
      //         authors: [
      //           {
      //             id: 1518087,
      //             user: null,
      //             headline: null,
      //             last_name: 'Bonneh',
      //             first_name: 'Yoram',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1654387,
      //             user: null,
      //             headline: null,
      //             last_name: 'Kadosh',
      //             first_name: 'Oren',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3227962,
      //             user: null,
      //             headline: null,
      //             last_name: 'Aidinoff',
      //             first_name: 'Elena',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677938,
      //             user: null,
      //             headline: null,
      //             last_name: 'Shani',
      //             first_name: 'S',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677939,
      //             user: null,
      //             headline: null,
      //             last_name: 'Gavrieli',
      //             first_name: 'Eliran',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677940,
      //             user: null,
      //             headline: null,
      //             last_name: 'Sacher',
      //             first_name: 'Yaron',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677941,
      //             user: null,
      //             headline: null,
      //             last_name: 'Cismariu-Potash',
      //             first_name: 'Keren',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 89030,
      //           name: 'bioRxiv',
      //           slug: 'biorxiv-1',
      //           image: null,
      //           description:
      //             'provides preprints in biological sciences, including subfields like neuroscience, genomics, and physiology, operated by Cold Spring Harbor Laboratory',
      //         },
      //         abstract:
      //           'Oculomotor function is a sensitive marker of neurological impairment with smooth pursuit deficiencies investigated in various disorders. However, the oculomotor deficits following traumatic brain injury (TBI) have not been fully characterized. In this study, we employed a novel bedside eye tracking paradigm to assess oculomotor dysfunction in 30 TBI patients and 30 age matched controls. Our paradigm utilized short, repeated linear tracking segments with head free recording, enabling the extraction of multiple oculomotor indices, including saccadic pursuit, tracking deviation under occlusion, initial tracking speed, initial saccade latency, pupil response, and vergence instability. TBI patients exhibited widespread deficits across these indices (AUC: 0.71 to 0.84), which correlated significantly with functional recovery, as measured by the Functional Independence Measure (R: 0.41 to 0.78, p &lt; 0.001) but not with the initial Glasgow Coma Scale scores. These findings suggest that TBI disrupts multiple components of the oculomotor system, extending to predictive tracking, pupil-linked arousal, and binocular coordination. Additionally, preliminary testing in disorders of consciousness (DOC) patients revealed fragmented tracking, suggesting a potential application for assessing perceptual awareness. Our findings support the use of eye tracking as a promising tool for quantifying brain function in TBI, with potential applications in prognosis, rehabilitation monitoring, and broader neurological assessment.',
      //         bounties: [
      //           {
      //             id: 4244,
      //             hub: {
      //               name: 'Neurology',
      //               slug: 'neurology',
      //             },
      //             amount: '700.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4244,
      //                 amount: 700,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-22T21:47:35.051762Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Shani',
      //             first_name: 'S',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5112993173',
      //             raw_author_name: 'Shimrit Shani',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Gavrieli',
      //             first_name: 'Eliran',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5116866293',
      //             raw_author_name: 'Eliran Gavrieli',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-1084-9134',
      //             countries: [],
      //             last_name: 'Kadosh',
      //             first_name: 'Oren',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5028837397',
      //             raw_author_name: 'Oren Kadosh',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-9786-1098',
      //             countries: [],
      //             last_name: 'Sacher',
      //             first_name: 'Yaron',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5031005334',
      //             raw_author_name: 'Yaron Sacher',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Cismariu-Potash',
      //             first_name: 'Keren',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5038677402',
      //             raw_author_name: 'Keren Cismariu-Potash',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Aidinoff',
      //             first_name: 'Elena',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5055699009',
      //             raw_author_name: 'Elena Aidinoff',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-1091-639X',
      //             countries: [],
      //             last_name: 'Bonneh',
      //             first_name: 'Yoram',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5058878020',
      //             raw_author_name: 'Yoram S Bonneh',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //         ],
      //         created_date: '2025-04-07T20:24:48.045586Z',
      //       },
      //       created_date: '2025-04-07T20:24:49.153401Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1786676,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348166,
      //         doi: '10.1101/2025.03.31.646228',
      //         hub: null,
      //         slug: 'substrate-stiffness-and-shear-stress-collectively-regulate-the-inflammatory-phenotype-in-cultured-human-brain-microvascular-endothelial-cells',
      //         title:
      //           'Substrate stiffness and shear stress collectively regulate the inflammatory phenotype in cultured human brain microvascular endothelial cells',
      //         authors: [
      //           {
      //             id: 1046785,
      //             user: null,
      //             headline: null,
      //             last_name: 'Lippmann',
      //             first_name: 'Ethan',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1104692,
      //             user: null,
      //             headline: null,
      //             last_name: 'Murray',
      //             first_name: 'Heather',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1213734,
      //             user: null,
      //             headline: null,
      //             last_name: 'Jefferson',
      //             first_name: 'Angela',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1387911,
      //             user: null,
      //             headline: null,
      //             last_name: 'Kjar',
      //             first_name: 'Andrew',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1411828,
      //             user: null,
      //             headline: null,
      //             last_name: 'Yates',
      //             first_name: 'A',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1461196,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ligocki',
      //             first_name: 'Alexander',
      //             profile_image: null,
      //           },
      //           {
      //             id: 6526517,
      //             user: null,
      //             headline: null,
      //             last_name: 'Kim',
      //             first_name: 'Hyosung',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677936,
      //             user: null,
      //             headline: null,
      //             last_name: 'Chavarría',
      //             first_name: 'Daniel',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677937,
      //             user: null,
      //             headline: null,
      //             last_name: 'Masters',
      //             first_name: 'Haley',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 89030,
      //           name: 'bioRxiv',
      //           slug: 'biorxiv-1',
      //           image: null,
      //           description:
      //             'provides preprints in biological sciences, including subfields like neuroscience, genomics, and physiology, operated by Cold Spring Harbor Laboratory',
      //         },
      //         abstract:
      //           'Brain endothelial cells experience mechanical forces in the form of blood flow-mediated shear stress and underlying matrix stiffness, but intersectional contributions of these factors towards blood-brain barrier (BBB) impairment and neurovascular dysfunction have not been extensively studied. Here, we developed in vitro models to examine the sensitivity of primary human brain microvascular endothelial cells (BMECs) to substrate stiffness, with or without exposure to fluid shear stress. Using a combination of molecular profiling techniques, we show that BMECs exhibit an inflammatory signature at both the mRNA and protein level when cultured on gelatin substrates of intermediate stiffness (~30 kPa) versus soft substrates (~6 kPa). Exposure to modest fluid shear stress (1.7 dyne/cm2) partially attenuated this signature, including reductions in levels of soluble chemoattractants and surface ICAM-1. Overall, our results indicate that increased substrate stiffness promotes an inflammatory phenotype in BMECs that is dampened in the presence of fluid shear stress.',
      //         bounties: [
      //           {
      //             id: 4245,
      //             hub: null,
      //             amount: '700.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4245,
      //                 amount: 700,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-22T21:47:44.376227Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0003-3539-3994',
      //             countries: [],
      //             last_name: 'Yates',
      //             first_name: 'A',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5036371024',
      //             raw_author_name: 'Alexis Yates',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-8953-3708',
      //             countries: [],
      //             last_name: 'Murray',
      //             first_name: 'Heather',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5081085768',
      //             raw_author_name: 'Heather Murray',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-5402-8752',
      //             countries: [],
      //             last_name: 'Kjar',
      //             first_name: 'Andrew',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5079245646',
      //             raw_author_name: 'Andrew Kjar',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-6042-2825',
      //             countries: [],
      //             last_name: 'Chavarría',
      //             first_name: 'Daniel',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5037945118',
      //             raw_author_name: 'Daniel Chavarria',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Masters',
      //             first_name: 'Haley',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5113249983',
      //             raw_author_name: 'Haley Masters',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2159-419X',
      //             countries: [],
      //             last_name: 'Kim',
      //             first_name: 'Hyosung',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5107980711',
      //             raw_author_name: 'Hyosung Kim',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-5624-4763',
      //             countries: [],
      //             last_name: 'Ligocki',
      //             first_name: 'Alexander',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5061146225',
      //             raw_author_name: 'Alexander Ligocki',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-8245-0587',
      //             countries: [],
      //             last_name: 'Jefferson',
      //             first_name: 'Angela',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5065822809',
      //             raw_author_name: 'Angela Jefferson',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-5703-5747',
      //             countries: [],
      //             last_name: 'Lippmann',
      //             first_name: 'Ethan',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5043187915',
      //             raw_author_name: 'Ethan Lippmann',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //         ],
      //         created_date: '2025-04-07T20:23:37.940822Z',
      //       },
      //       created_date: '2025-04-07T20:23:38.780521Z',
      //       action_date: '2025-04-02T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1786655,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348165,
      //         doi: '10.1101/2025.03.28.645932',
      //         hub: {
      //           name: 'Biotechnology',
      //           slug: 'biotechnology',
      //         },
      //         slug: 'casein-kinase-1-regulated-formation-of-gvbs-induces-resilience-to-tau-pathology-mediated-protein-synthesis-impairment',
      //         title:
      //           'Casein kinase 1δ-regulated formation of GVBs induces resilience to tau pathology-mediated protein synthesis impairment',
      //         authors: [
      //           {
      //             id: 1024461,
      //             user: null,
      //             headline: null,
      //             last_name: 'Li',
      //             first_name: 'Ka',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1240246,
      //             user: null,
      //             headline: null,
      //             last_name: 'Scheper',
      //             first_name: 'Wiep',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1528919,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ligthart',
      //             first_name: 'Thijmen',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677930,
      //             user: null,
      //             headline: null,
      //             last_name: 'Smits',
      //             first_name: 'Jasper',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677931,
      //             user: null,
      //             headline: null,
      //             last_name: 'Jorge‐Oliva',
      //             first_name: 'Marta',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677932,
      //             user: null,
      //             headline: null,
      //             last_name: 'Middelhoff',
      //             first_name: 'Skip',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677933,
      //             user: null,
      //             headline: null,
      //             last_name: 'Schipper',
      //             first_name: 'Frits',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677934,
      //             user: null,
      //             headline: null,
      //             last_name: 'Garritsen',
      //             first_name: 'Renee',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677935,
      //             user: null,
      //             headline: null,
      //             last_name: 'Pita-Illobre',
      //             first_name: 'Débora',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: {
      //           id: 89030,
      //           name: 'bioRxiv',
      //           slug: 'biorxiv-1',
      //           image: null,
      //           description:
      //             'provides preprints in biological sciences, including subfields like neuroscience, genomics, and physiology, operated by Cold Spring Harbor Laboratory',
      //         },
      //         abstract:
      //           'In Alzheimers disease, many surviving neurons with tau pathology contain granulovacuolar degeneration bodies (GVBs), neuron-specific lysosomal structures induced by pathological tau assemblies. This could indicate a neuroprotective role for GVBs, however, the mechanism of GVB formation and its functional implications are elusive. Here, we demonstrate that GVB formation depends on CK1delta activity and basal autophagy. We show that neurons with GVBs (GVB+) are resilient to tau-induced impairment of global protein synthesis and are protected against tau-mediated neurodegeneration. GVB+ neurons have multiple adaptations to counteract the tau pathology-induced decline in protein synthesis, including increased ribosomal content. Importantly, unlike neurons without GVBs, GVB+ neurons fully retain the capacity to induce long-term potentiation-induced protein synthesis in the presence of tau pathology. Our results have identified CK1delta as a key regulator of GVB formation that confers a protective neuron-specific proteostatic stress response to tau pathology. Our findings provide novel opportunities for targeting neuronal resilience in tauopathies.',
      //         bounties: [
      //           {
      //             id: 4246,
      //             hub: {
      //               name: 'Biotechnology',
      //               slug: 'biotechnology',
      //             },
      //             amount: '700.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4246,
      //                 amount: 700,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-22T21:47:51.062713Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Smits',
      //             first_name: 'Jasper',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5035220382',
      //             raw_author_name: 'Jasper Franciscus Maria Smits',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-7573-0177',
      //             countries: [],
      //             last_name: 'Ligthart',
      //             first_name: 'Thijmen',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5061530504',
      //             raw_author_name: 'Thijmen Wilhelmus Ligthart',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Jorge‐Oliva',
      //             first_name: 'Marta',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5003373230',
      //             raw_author_name: 'Marta Jorge-Oliva',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Middelhoff',
      //             first_name: 'Skip',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5116879734',
      //             raw_author_name: 'Skip Middelhoff',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Schipper',
      //             first_name: 'Frits',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5063207294',
      //             raw_author_name: 'Fleur Schipper',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Garritsen',
      //             first_name: 'Renee',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5116879735',
      //             raw_author_name: 'Renee Garritsen',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: null,
      //             countries: [],
      //             last_name: 'Pita-Illobre',
      //             first_name: 'Débora',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5059163054',
      //             raw_author_name: 'Debora Pita-Illobre',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-6983-5055',
      //             countries: [],
      //             last_name: 'Li',
      //             first_name: 'Ka',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5037003034',
      //             raw_author_name: 'Ka Wan Li',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-1431-4559',
      //             countries: [],
      //             last_name: 'Scheper',
      //             first_name: 'Wiep',
      //             affiliations: [],
      //             open_alex_id: 'https://openalex.org/A5024877991',
      //             raw_author_name: 'Wiep Scheper',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [],
      //           },
      //         ],
      //         created_date: '2025-04-07T20:23:07.702210Z',
      //       },
      //       created_date: '2025-04-07T20:23:08.730925Z',
      //       action_date: '2025-04-02T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784838,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348022,
      //         doi: '10.26434/chemrxiv-2024-3lvxl-v3',
      //         hub: {
      //           name: 'Catalysis',
      //           slug: 'catalysis',
      //         },
      //         slug: 'conversion-of-syngas-to-ethanol-over-a-rhfe-alloy-catalyst',
      //         title: 'Conversion of Syngas to Ethanol over a RhFe Alloy Catalyst',
      //         authors: [
      //           {
      //             id: 1865649,
      //             user: null,
      //             headline: null,
      //             last_name: 'Copéret',
      //             first_name: 'Christophe',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1988188,
      //             user: null,
      //             headline: null,
      //             last_name: 'Zhou',
      //             first_name: 'X.',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3147594,
      //             user: null,
      //             headline: null,
      //             last_name: 'Docherty',
      //             first_name: 'Scott',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4630670,
      //             user: null,
      //             headline: null,
      //             last_name: 'Lam',
      //             first_name: 'Erwin',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4864039,
      //             user: null,
      //             headline: null,
      //             last_name: 'Zhou',
      //             first_name: 'Wei',
      //             profile_image: null,
      //           },
      //           {
      //             id: 6151814,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ehinger',
      //             first_name: 'Christian',
      //             profile_image: null,
      //           },
      //           {
      //             id: 6513904,
      //             user: null,
      //             headline: null,
      //             last_name: 'Hou',
      //             first_name: 'Yuhui',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677821,
      //             user: null,
      //             headline: null,
      //             last_name: 'Laveille',
      //             first_name: 'Paco',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         abstract:
      //           'The direct conversion of syngas to ethanol is a promising route for the sustainable production of value-added chemicals and fuels. While Fe-promoted Rh-based catalysts have long been studied because of their notable activity and selectivity towards ethanol, the nature of Rh-Fe interaction and the catalyst structure under reaction conditions remain poorly understood due to the complexity of heterogeneous catalysts prepared by conventional approaches. In this work, we construct well-defined RhFe@SiO2 model catalysts via surface organometallic chemistry (SOMC), composed of small and narrowly distributed nanoparticles supported on silica. Such RhFe@SiO2 catalyst converts syngas into ethanol, reaching an overall selectivity of 38% ethanol among all products at 8.4% CO conversion, while the non-promoted Rh@SiO2 catalyst mostly yields methane (selectivity &gt; 90%) and no ethanol. Detailed in situ XAS and DRIFTS studies reveal that the RhFe@SiO2 catalyst corresponds to Rh-Fe alloy with ca. 3:1 Rh/Fe ratio alongside residual FeII single site. The alloy is stable under working conditions, promoting high activity and ethanol selectivity.',
      //         bounties: [
      //           {
      //             id: 4241,
      //             hub: {
      //               name: 'Catalysis',
      //               slug: 'catalysis',
      //             },
      //             amount: '650.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4241,
      //                 amount: 650,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-21T23:59:16.134393Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0002-4287-8941',
      //             countries: ['CH'],
      //             last_name: 'Zhou',
      //             first_name: 'Wei',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Department of Chemistry and Applied Bioscience, ETH Zürich, CH-8093 Zürich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5072291924',
      //             raw_author_name: 'Zhou Wei',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Department of Chemistry and Applied Bioscience, ETH Zürich, CH-8093 Zürich, Switzerland',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-8605-3669',
      //             countries: ['CH'],
      //             last_name: 'Docherty',
      //             first_name: 'Scott',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5017539442',
      //             raw_author_name: 'Scott Docherty',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-8641-7928',
      //             countries: ['CH'],
      //             last_name: 'Lam',
      //             first_name: 'Erwin',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Swiss Cat+ East, ETH Zürich, CH-8093 Zürich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5073457373',
      //             raw_author_name: 'Erwin Lam',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Swiss Cat+ East, ETH Zürich, CH-8093 Zürich, Switzerland',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-2013-7429',
      //             countries: ['CH'],
      //             last_name: 'Ehinger',
      //             first_name: 'Christian',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5034885467',
      //             raw_author_name: 'Christian Ehinger',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-9840-9159',
      //             countries: ['CH'],
      //             last_name: 'Zhou',
      //             first_name: 'X.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5071447585',
      //             raw_author_name: 'Xiaoyu Zhou',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-1616-562X',
      //             countries: ['CH'],
      //             last_name: 'Hou',
      //             first_name: 'Yuhui',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Swiss Cat+ East, ETH Zürich, CH-8093 Zürich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5022762260',
      //             raw_author_name: 'Yuhui Hou',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Swiss Cat+ East, ETH Zürich, CH-8093 Zürich, Switzerland',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2687-0093',
      //             countries: ['CH'],
      //             last_name: 'Laveille',
      //             first_name: 'Paco',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Swiss Cat+ East, ETH Zürich, CH-8093 Zürich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5088716942',
      //             raw_author_name: 'Paco Laveille',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Swiss Cat+ East, ETH Zürich, CH-8093 Zürich, Switzerland',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-9660-3890',
      //             countries: ['CH'],
      //             last_name: 'Copéret',
      //             first_name: 'Christophe',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string:
      //                   'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5019537622',
      //             raw_author_name: 'Christophe Copéret',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Department of Chemistry and Applied Biosciences, ETH Zürich, CH-8093 Zurich, Switzerland',
      //             ],
      //           },
      //         ],
      //         created_date: '2025-04-06T22:10:36.411882Z',
      //       },
      //       created_date: '2025-04-06T22:11:14.379913Z',
      //       action_date: '2025-03-26T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784784,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348020,
      //         doi: '10.26434/chemrxiv-2025-nr4f2',
      //         hub: {
      //           name: 'Electrical And Electronic Engineering',
      //           slug: 'electrical-and-electronic-engineering',
      //         },
      //         slug: 'laser-engineered-iridium-based-nanoparticles-with-high-activity-and-stability',
      //         title:
      //           'Laser-Engineered Iridium-Based Nanoparticles with High Activity and Stability',
      //         authors: [
      //           {
      //             id: 1106240,
      //             user: null,
      //             headline: null,
      //             last_name: 'Wang',
      //             first_name: 'Huize',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1933235,
      //             user: null,
      //             headline: null,
      //             last_name: 'Mayrhofer',
      //             first_name: 'Karl',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1933237,
      //             user: null,
      //             headline: null,
      //             last_name: 'Hutzler',
      //             first_name: 'Andreas',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2795567,
      //             user: null,
      //             headline: null,
      //             last_name: 'Fortunato',
      //             first_name: 'Guilherme',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3407845,
      //             user: null,
      //             headline: null,
      //             last_name: 'Parada',
      //             first_name: 'Walter',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3407846,
      //             user: null,
      //             headline: null,
      //             last_name: 'Nikolaienko',
      //             first_name: 'Pavlo',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3563430,
      //             user: null,
      //             headline: null,
      //             last_name: 'Morales',
      //             first_name: 'A.',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4248679,
      //             user: null,
      //             headline: null,
      //             last_name: 'Ledendecker',
      //             first_name: 'Marc',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5058344,
      //             user: null,
      //             headline: null,
      //             last_name: 'Zhao',
      //             first_name: 'Wei',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677809,
      //             user: null,
      //             headline: null,
      //             last_name: 'Pfeifer',
      //             first_name: 'Philipp',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677810,
      //             user: null,
      //             headline: null,
      //             last_name: 'Lai',
      //             first_name: 'Wenwei',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677811,
      //             user: null,
      //             headline: null,
      //             last_name: 'Göpfert',
      //             first_name: 'A.',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677812,
      //             user: null,
      //             headline: null,
      //             last_name: 'Lim',
      //             first_name: 'Sumin',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677813,
      //             user: null,
      //             headline: null,
      //             last_name: 'Goßler',
      //             first_name: 'Mattis',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677814,
      //             user: null,
      //             headline: null,
      //             last_name: 'Malinovic',
      //             first_name: 'Marko',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677815,
      //             user: null,
      //             headline: null,
      //             last_name: 'Bhuyan',
      //             first_name: 'Pallabi',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         abstract:
      //           'Designing high-performance, stable catalysts is essential for electrochemical hydrogen production. Crystalline iridium oxide is one of the few materials that remain stable under the harsh acidic conditions of polymer electrolyte membrane water electrolysis (PEMWE). However, its low activity and iridium scarcity require strategies to enhance atomic utilization. Conventional high-temperature post-synthetic processing increases the share of rutile-phase iridium oxide while promoting particle growth, reducing catalytic activity due to a diminished surface area. Here we present a laser-induced nano oven method using a silicon dioxide matrix as a nanoscale reaction chamber, enabling solid-state nanoparticle synthesis under ambient conditions while preventing agglomeration and allowing precise size control. The synthesized ultra-small crystalline rutile iridium oxide of ~2 nm achieves a high mass activity of 350 ± 15 A gIr-1 at 300 mV overpotential. Analysis using a channel flow cell with on-line inductively coupled plasma mass spectrometry confirms that laser-engineered iridium oxide exhibits superior stability compared to commercial iridium oxide, achieving an optimal balance of activity and stability. Operando electron impact mass spectrometry provided the synthesis mechanistic insights, demonstrating the potential of this strategy for synthesizing ultra-small crystalline metals and metal oxides for various applications.',
      //         bounties: [
      //           {
      //             id: 4240,
      //             hub: {
      //               name: 'Electrical And Electronic Engineering',
      //               slug: 'electrical-and-electronic-engineering',
      //             },
      //             amount: '650.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4240,
      //                 amount: 650,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-21T23:59:13.218425Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0002-0424-8068',
      //             countries: ['DE'],
      //             last_name: 'Wang',
      //             first_name: 'Huize',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5002773574',
      //             raw_author_name: 'Huize Wang',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               'Technical University of Munich',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0009-0004-0216-6167',
      //             countries: ['DE'],
      //             last_name: 'Pfeifer',
      //             first_name: 'Philipp',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5000228881',
      //             raw_author_name: 'Philipp Pfeifer',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technical University of Munich'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['DE'],
      //             last_name: 'Lai',
      //             first_name: 'Wenwei',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I181369854'],
      //                 raw_affiliation_string: 'Friedrich-Alexander-Universität Erlangen-Nürnberg',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5062877297',
      //             raw_author_name: 'Wenwei Lai',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Friedrich-Alexander-Universität Erlangen-Nürnberg'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['DE'],
      //             last_name: 'Göpfert',
      //             first_name: 'A.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5041966545',
      //             raw_author_name: 'Andreas Göpfert',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-8954-8862',
      //             countries: ['DE'],
      //             last_name: 'Lim',
      //             first_name: 'Sumin',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5091678599',
      //             raw_author_name: 'Sumin Lim',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technical University of Munich'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-7138-7228',
      //             countries: ['DE'],
      //             last_name: 'Zhao',
      //             first_name: 'Wei',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5100669235',
      //             raw_author_name: 'Wei Zhao',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technical University of Munich'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-9116-7559',
      //             countries: ['DE'],
      //             last_name: 'Morales',
      //             first_name: 'A.',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5036315412',
      //             raw_author_name: 'A.Lucía Morales',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //             ],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['DE'],
      //             last_name: 'Goßler',
      //             first_name: 'Mattis',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5116689122',
      //             raw_author_name: 'Mattis Goßler',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-4022-5939',
      //             countries: ['DE'],
      //             last_name: 'Malinovic',
      //             first_name: 'Marko',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5054900838',
      //             raw_author_name: 'Marko Malinovic',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technical University of Munich'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['DE'],
      //             last_name: 'Bhuyan',
      //             first_name: 'Pallabi',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5116226805',
      //             raw_author_name: 'Pallabi Bhuyan',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technical University of Munich'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-5413-1917',
      //             countries: ['DE'],
      //             last_name: 'Parada',
      //             first_name: 'Walter',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5065995741',
      //             raw_author_name: 'Walter Parada',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-1508-7589',
      //             countries: ['DE'],
      //             last_name: 'Nikolaienko',
      //             first_name: 'Pavlo',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5053533082',
      //             raw_author_name: 'Pavlo Nikolaienko',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-4248-0431',
      //             countries: ['DE'],
      //             last_name: 'Mayrhofer',
      //             first_name: 'Karl',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5053735446',
      //             raw_author_name: 'Karl Mayrhofer',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-0768-4156',
      //             countries: ['DE'],
      //             last_name: 'Fortunato',
      //             first_name: 'Guilherme',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5055974229',
      //             raw_author_name: 'Guilherme V. Fortunato',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technical University of Munich'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-5484-707X',
      //             countries: ['DE'],
      //             last_name: 'Hutzler',
      //             first_name: 'Andreas',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210109708'],
      //                 raw_affiliation_string:
      //                   'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5019937016',
      //             raw_author_name: 'Andreas Hutzler',
      //             is_corresponding: false,
      //             raw_affiliation_strings: [
      //               'Helmholtz Institute Erlangen-Nürnberg for Renewable Energy',
      //             ],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-3740-401X',
      //             countries: ['DE'],
      //             last_name: 'Ledendecker',
      //             first_name: 'Marc',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I62916508'],
      //                 raw_affiliation_string: 'Technical University of Munich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5050336219',
      //             raw_author_name: 'Marc Ledendecker',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Technical University of Munich'],
      //           },
      //         ],
      //         created_date: '2025-04-06T21:48:25.391158Z',
      //       },
      //       created_date: '2025-04-06T21:49:53.453710Z',
      //       action_date: '2025-03-19T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784735,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348019,
      //         doi: '10.26434/chemrxiv-2025-rsqr9',
      //         hub: {
      //           name: 'Mechanical Engineering',
      //           slug: 'mechanical-engineering',
      //         },
      //         slug: 'how-does-the-ni-ga-alloy-structure-tune-methanol-productivity-and-selectivity',
      //         title:
      //           'How does the Ni-Ga Alloy Structure Tune Methanol Productivity and Selectivity?',
      //         authors: [
      //           {
      //             id: 1963704,
      //             user: null,
      //             headline: null,
      //             last_name: 'Müller',
      //             first_name: 'Christoph',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3570486,
      //             user: null,
      //             headline: null,
      //             last_name: 'Checchia',
      //             first_name: 'Stefano',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4630672,
      //             user: null,
      //             headline: null,
      //             last_name: 'Comas‐Vives',
      //             first_name: 'Aleix',
      //             profile_image: null,
      //           },
      //           {
      //             id: 4650344,
      //             user: null,
      //             headline: null,
      //             last_name: 'Abdala',
      //             first_name: 'Paula',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677807,
      //             user: null,
      //             headline: null,
      //             last_name: 'Zimmerli',
      //             first_name: 'Nora',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677808,
      //             user: null,
      //             headline: null,
      //             last_name: 'Usuga',
      //             first_name: 'Andres-Felipe',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         abstract:
      //           'In this work, we assess how the structure of SiO₂-supported, Ni-Ga alloys determines their activity and selectivity for the hydrogenation of CO₂ to methanol. Using a hydrothermal deposition-precipitation approach followed by activation at 700°C in H₂, we synthesize catalysts containing α-Ni, α-Ni₉Ga, α’-Ni₃Ga, or δ-Ni₅Ga₃ phases supported on amorphous SiO2. Operando X-ray pair distribution function analysis and X-ray absorption spectroscopy confirm unequivocally the structure of all phases and their stability under reaction conditions; additionally, all catalysts contain GaOx species in varying amounts. We observe that the catalysts α’-Ni₃Ga/SiO₂ and δ-Ni₅Ga₃/SiO₂ exhibit high methanol formation rates (~0.8 mmolMeOH molNi⁻¹ s⁻¹), which are 27 times greater than those of α-Ni₉Ga/SiO₂ and α-Ni/SiO₂. Notably, α’-Ni₃Ga/SiO₂ shows the highest selectivity for methanol at 71%, compared to 55% for δ-Ni₅Ga₃/SiO₂ and 11% for α-Ni₉Ga/SiO₂, which challenges the conventional view of α’-Ni₃Ga being a poor catalyst for methanol synthesis. To explain the high methanol selectivity and productivity of α’-Ni₃Ga/SiO₂ compared to the other alloy phases, DFT calculations were performed. It was found that the Ni-rich step sites in α’-Ni₃Ga effectively stabilize key reaction intermediates (HCOO* and CH₃O*) for the formation of methanol. However, such Ni-rich step sites in α’-Ni₃Ga also favour CO* dissociation, which could facilitate methane formation, yet the presence of GaOx decreases the stability of CO* on α’-Ni₃Ga, explaining ultimately the promotion of HCOO* formation. This study highlights the importance of Ga species (both metallic and oxidic) in modulating the electronic properties of heterogeneous catalysts, providing a versatile toolbox to stabilize key reaction intermediates, leading ultimately to high product selectivity.',
      //         bounties: [
      //           {
      //             id: 4239,
      //             hub: {
      //               name: 'Mechanical Engineering',
      //               slug: 'mechanical-engineering',
      //             },
      //             amount: '650.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4239,
      //                 amount: 650,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-21T23:59:11.106994Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: null,
      //             countries: ['CH'],
      //             last_name: 'Zimmerli',
      //             first_name: 'Nora',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string: 'ETH Zurich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5038195487',
      //             raw_author_name: 'Nora Zimmerli',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['ETH Zurich'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-4580-2640',
      //             countries: ['ES'],
      //             last_name: 'Usuga',
      //             first_name: 'Andres-Felipe',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I123044942'],
      //                 raw_affiliation_string: 'Universitat Autònoma de Barcelona',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5102910348',
      //             raw_author_name: 'Andres-Felipe Usuga',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Universitat Autònoma de Barcelona'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-0499-4885',
      //             countries: ['FR'],
      //             last_name: 'Checchia',
      //             first_name: 'Stefano',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I2801997478'],
      //                 raw_affiliation_string: 'European Synchrotron Radiation Facility',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5011287994',
      //             raw_author_name: 'Stefano Checchia',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['European Synchrotron Radiation Facility'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-7002-1582',
      //             countries: ['AT', 'ES'],
      //             last_name: 'Comas‐Vives',
      //             first_name: 'Aleix',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I145847075'],
      //                 raw_affiliation_string: 'TU Wien',
      //               },
      //               {
      //                 institution_ids: ['https://openalex.org/I123044942'],
      //                 raw_affiliation_string: 'Universitat Autònoma de Barcelona',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5027432625',
      //             raw_author_name: 'Aleix Comas Vives',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['TU Wien', 'Universitat Autònoma de Barcelona'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-2234-6902',
      //             countries: ['CH'],
      //             last_name: 'Müller',
      //             first_name: 'Christoph',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string: 'ETH Zurich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5024347042',
      //             raw_author_name: 'Christoph Müller',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['ETH Zurich'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2011-1707',
      //             countries: ['CH'],
      //             last_name: 'Abdala',
      //             first_name: 'Paula',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I35440088'],
      //                 raw_affiliation_string: 'ETH Zurich',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5005303303',
      //             raw_author_name: 'Paula Abdala',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['ETH Zurich'],
      //           },
      //         ],
      //         created_date: '2025-04-06T21:38:14.356756Z',
      //       },
      //       created_date: '2025-04-06T21:42:06.004702Z',
      //       action_date: '2025-03-19T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784708,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348018,
      //         doi: '10.26434/chemrxiv-2025-1v585',
      //         hub: {
      //           name: 'Atomic And Molecular Physics, And Optics',
      //           slug: 'atomic-and-molecular-physics-and-optics',
      //         },
      //         slug: 'selective-semi-hydrogenation-of-acetylene-using-a-single-atom-cobalt-on-carbon-nitride-photocatalyst-with-water-as-a-proton-source',
      //         title:
      //           'Selective semi-hydrogenation of acetylene using a single-atom cobalt on carbon nitride photocatalyst with water as a proton source',
      //         authors: [
      //           {
      //             id: 1919230,
      //             user: null,
      //             headline: null,
      //             last_name: 'Dražić',
      //             first_name: 'Goran',
      //             profile_image: null,
      //           },
      //           {
      //             id: 1933704,
      //             user: null,
      //             headline: null,
      //             last_name: 'Celorrio',
      //             first_name: 'Verónica',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2070261,
      //             user: null,
      //             headline: null,
      //             last_name: 'Đorđević∞',
      //             first_name: 'Luka',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2139746,
      //             user: null,
      //             headline: null,
      //             last_name: 'Perilli',
      //             first_name: 'Daniele',
      //             profile_image: null,
      //           },
      //           {
      //             id: 2139749,
      //             user: null,
      //             headline: null,
      //             last_name: 'Valentin',
      //             first_name: 'Cristiana',
      //             profile_image: null,
      //           },
      //           {
      //             id: 3118227,
      //             user: null,
      //             headline: null,
      //             last_name: 'Calvillo',
      //             first_name: 'Laura',
      //             profile_image: null,
      //           },
      //           {
      //             id: 5436784,
      //             user: null,
      //             headline: null,
      //             last_name: 'Arcudi',
      //             first_name: 'Francesca',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677805,
      //             user: null,
      //             headline: null,
      //             last_name: 'Fortunato',
      //             first_name: 'Anna',
      //             profile_image: null,
      //           },
      //           {
      //             id: 7677806,
      //             user: null,
      //             headline: null,
      //             last_name: 'Dron',
      //             first_name: 'Alexandru',
      //             profile_image: null,
      //           },
      //         ],
      //         journal: null,
      //         abstract:
      //           'Light-powered strategies for the semi-hydrogenation of acetylene to ethylene are rapidly emerging as sustainable alternatives to the traditional thermochemical processes. The development of a robust, selective, as well as recyclable, non-noble catalyst that can be powered by visible light to accomplish this important reaction using water as the proton source remains a key challenge. Here we report the first demonstration of cobalt single-atom catalysts anchored on carbon-nitride (Co-CN) as an all-in-one photocatalysts for the semi-hydrogenation reaction of acetylene to ethylene using water as the proton source and no organic solvents or hydrogenated organics, offering advantages over current hydrogenation technologies. Carbon nitride is a photoactive support that hosts the individual catalytic active sites of cobalt thus combining photosensitizer and cocatalyst in one unit, in line with first-principles modelling. Under visible light irradiation, Co-CN reduces acetylene to ethylene with stable activity for over 40 days of continuous operation and ≥99.9%, selectivity and provides means for coupling organic upgrading to produce valuable oxidation products. The heterogenous Co-CN can be easily recovered and reused repeatedly without loss of catalytic activity and structural integrity. Thereby, the reported hydrogenation photocatalyst overcomes the need of coupling a separate photosensitiser to a catalyst providing an integrated and recyclable platform, and using noble metal catalysts with an external H2 gas feed. Thanks to these features, together with longevity and semi-hydrogenation selectivity, this system holds potential for practical implementation of light-driven acetylene reduction and for exploration of other non-noble metal single atom heterogenous photocatalysts to achieve this important transformation using water as the proton source.',
      //         bounties: [
      //           {
      //             id: 4238,
      //             hub: {
      //               name: 'Atomic And Molecular Physics, And Optics',
      //               slug: 'atomic-and-molecular-physics-and-optics',
      //             },
      //             amount: '650.0000000000',
      //             status: 'OPEN',
      //             bounty_type: 'REVIEW',
      //             contributors: [],
      //             contributions: [
      //               {
      //                 id: 4238,
      //                 amount: 650,
      //                 author: {
      //                   id: 973869,
      //                   user: {
      //                     id: 39602,
      //                     email: 'main@researchhub.foundation',
      //                     last_name: 'Account',
      //                     first_name: 'Main',
      //                     is_verified: false,
      //                   },
      //                   headline: '',
      //                   last_name: 'Foundation',
      //                   first_name: 'ResearchHub',
      //                   profile_image:
      //                     'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob',
      //                 },
      //               },
      //             ],
      //             document_type: 'PAPER',
      //             expiration_date: '2025-04-21T23:58:58.087727Z',
      //           },
      //         ],
      //         work_type: 'preprint',
      //         raw_authors: [
      //           {
      //             orcid: 'https://orcid.org/0000-0001-5653-0973',
      //             countries: ['IT'],
      //             last_name: 'Fortunato',
      //             first_name: 'Anna',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I138689650'],
      //                 raw_affiliation_string: 'University of Padova',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5078434088',
      //             raw_author_name: 'Anna Fortunato',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Padova'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-3082-3986',
      //             countries: ['IT'],
      //             last_name: 'Perilli',
      //             first_name: 'Daniele',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I66752286'],
      //                 raw_affiliation_string: 'Università degli Studi di Milano-Bicocca',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5088966037',
      //             raw_author_name: 'Daniele Perilli',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Università degli Studi di Milano-Bicocca'],
      //           },
      //           {
      //             orcid: null,
      //             countries: ['IT'],
      //             last_name: 'Dron',
      //             first_name: 'Alexandru',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I138689650'],
      //                 raw_affiliation_string: 'University of Padova',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5116629711',
      //             raw_author_name: 'Alexandru Dron',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Padova'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-2818-3844',
      //             countries: ['GB'],
      //             last_name: 'Celorrio',
      //             first_name: 'Verónica',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I2802711169'],
      //                 raw_affiliation_string: 'Diamond Light Source',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5020884368',
      //             raw_author_name: 'Verónica Celorrio',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Diamond Light Source'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-7809-8050',
      //             countries: ['SI'],
      //             last_name: 'Dražič',
      //             first_name: 'Goran',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I4210152560'],
      //                 raw_affiliation_string: 'National Institute of Chemistry Ljubljana',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5016652154',
      //             raw_author_name: 'Goran Dražić',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['National Institute of Chemistry Ljubljana'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0002-8346-7110',
      //             countries: ['IT'],
      //             last_name: 'Đorđević∞',
      //             first_name: 'Luka',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I138689650'],
      //                 raw_affiliation_string: 'University of Padova',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5018687853',
      //             raw_author_name: 'Luka Ðorđević',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Padova'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0001-9256-0133',
      //             countries: ['IT'],
      //             last_name: 'Calvillo',
      //             first_name: 'Laura',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I138689650'],
      //                 raw_affiliation_string: 'University of Padova',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5023100324',
      //             raw_author_name: 'Laura Calvillo',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Padova'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-4163-8062',
      //             countries: ['IT'],
      //             last_name: 'Valentin',
      //             first_name: 'Cristiana',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I66752286'],
      //                 raw_affiliation_string: 'Università degli Studi di Milano-Bicocca',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5076721274',
      //             raw_author_name: 'Cristiana Di Valentin',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['Università degli Studi di Milano-Bicocca'],
      //           },
      //           {
      //             orcid: 'https://orcid.org/0000-0003-1909-5241',
      //             countries: ['IT'],
      //             last_name: 'Arcudi',
      //             first_name: 'Francesca',
      //             affiliations: [
      //               {
      //                 institution_ids: ['https://openalex.org/I138689650'],
      //                 raw_affiliation_string: 'University of Padova',
      //               },
      //             ],
      //             open_alex_id: 'https://openalex.org/A5058718327',
      //             raw_author_name: 'Francesca Arcudi',
      //             is_corresponding: false,
      //             raw_affiliation_strings: ['University of Padova'],
      //           },
      //         ],
      //         created_date: '2025-04-06T21:30:38.418054Z',
      //       },
      //       created_date: '2025-04-06T21:31:14.528360Z',
      //       action_date: '2025-03-14T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784520,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348009,
      //         doi: '16D5YPXgm',
      //         hub: null,
      //         slug: 'improving-neonatal-care-an-active-dry-contact-electrode-based-continuous-eeg-monitoring-system-with-seizure-detection',
      //         title:
      //           'Improving Neonatal Care: An Active Dry-Contact Electrode-based Continuous EEG Monitoring System with Seizure Detection',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           'Objective: Neonates are highly susceptible to seizures, which can have severe long-term consequences if undetected and left untreated. Early detection is crucial and typically requires continuous electroencephalography (EEG) monitoring in a hospital setting, which is costly, inconvenient, and requires specialized experts for diagnosis. In this work, we propose a new low-cost active dry-contact electrode-based adjustable EEG headset, a new explainable deep learning model to detect neonatal seizures, and an advanced signal processing algorithm to remove artifacts to address the key aspects that lead to the underdiagnosis of neonatal seizures. Methods: EEG signals are acquired through active electrodes and processed using a custom-designed analog front end (AFE) that filters and digitizes the captured EEG signals. The adjustable headset is designed using three-dimensional (3D) printing and laser cutting to fit a wide range of head sizes. A deep learning model is developed to classify seizure and non-seizure epochs in real-time. Furthermore, a separate multimodal deep learning model is designed to remove noise artifacts. The device is tested on a pediatric patient with absence seizures in a hospital setting. Simultaneous recordings are captured using both the custom device and the commercial wet electrode device available in the hospital for comparison. Results: The signals obtained using our custom design and a commercial device show a high correlation (>0.8). Further analysis using signal-to-noise ratio values shows that our device can mitigate noise similar to the commercial device. The proposed deep learning model has improvements in accuracy and recall by 2.76% and 16.33%, respectively, compared to the state-of-the-art. Furthermore, the developed artifact removal algorithm can identify and remove artifacts while keeping seizure patterns intact. ',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Wickramasinghe',
      //             first_name: 'Nima L.',
      //           },
      //           {
      //             last_name: 'Udayantha',
      //             first_name: 'Dinuka Sandun',
      //           },
      //           {
      //             last_name: 'Abeyratne',
      //             first_name: 'Akila',
      //           },
      //           {
      //             last_name: 'Weerasinghe',
      //             first_name: 'Kavindu',
      //           },
      //           {
      //             last_name: 'Wickremasinghe',
      //             first_name: 'Kithmin',
      //           },
      //           {
      //             last_name: 'Wanigasinghe',
      //             first_name: 'Jithangi',
      //           },
      //           {
      //             last_name: 'De Silva',
      //             first_name: 'Anjula',
      //           },
      //           {
      //             last_name: 'Edussooriya',
      //             first_name: 'Chamira U. S.',
      //           },
      //         ],
      //         created_date: '2025-04-06T18:43:13.886859Z',
      //       },
      //       created_date: '2025-04-06T18:43:46.055682Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784519,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348008,
      //         doi: '13xL9OJ07',
      //         hub: null,
      //         slug: 'reliable-traffic-monitoring-using-low-cost-doppler-radar-units',
      //         title: 'Reliable Traffic Monitoring Using Low-Cost Doppler Radar Units',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           'Road traffic monitoring typically involves the counting and recording of vehicles on public roads over extended periods. The data gathered from such monitoring provides useful information to municipal authorities in urban areas. This paper presents a low-cost, widely deployable sensing subsystem based on Continuous Wave Doppler radar. The proposed system can perform vehicle detection and speed estimation with a total cost of less than 100 USD. The sensing system (including the hardware subsystem and the algorithms) is designed to be placed on the side of the road, allowing for easy deployment and serviceability. ',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Naidoo',
      //             first_name: 'Mishay',
      //           },
      //           {
      //             last_name: 'Paine',
      //             first_name: 'Stephen',
      //           },
      //           {
      //             last_name: 'Mishra',
      //             first_name: 'Amit Kumar',
      //           },
      //           {
      //             last_name: 'Gaffar',
      //             first_name: 'Mohammed Yunus Abdul',
      //           },
      //         ],
      //         created_date: '2025-04-06T18:42:13.325698Z',
      //       },
      //       created_date: '2025-04-06T18:42:26.170664Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784518,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348007,
      //         doi: 'TEdmvwU4',
      //         hub: null,
      //         slug: 'application-of-battery-storage-to-switching-predictive-control-of-power-distribution-systems-including-road-heating',
      //         title:
      //           'Application of Battery Storage to Switching Predictive Control of Power Distribution Systems Including Road Heating',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           "A road heating system is an electrical device which promotes snow melting by burying a heating cable as a thermal source underground. When integrating road heating into the power distribution system, we need to optimize the flow of electric power by appropriately integrating distributed power sources and conventional power distribution equipment. In this paper, we extend the power distribution system considered in the authors' previous study to the case where battery storage is installed. As a main result, we propose a predictive switching control that achieves the reduction of distribution loss, attenuation of voltage fluctuation, and efficient snow melting, simultaneously. We verify the effectiveness of the application of battery storage through numerical simulation. ",
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Kojima',
      //             first_name: 'Chiaki',
      //           },
      //           {
      //             last_name: 'Muto',
      //             first_name: 'Yuya',
      //           },
      //           {
      //             last_name: 'Akutsu',
      //             first_name: 'Hikaru',
      //           },
      //           {
      //             last_name: 'Shima',
      //             first_name: 'Rinnosuke',
      //           },
      //           {
      //             last_name: 'Susuki',
      //             first_name: 'Yoshihiko',
      //           },
      //         ],
      //         created_date: '2025-04-06T18:41:32.822658Z',
      //       },
      //       created_date: '2025-04-06T18:41:53.572943Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 6,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784517,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9348006,
      //         doi: 'FsWKoAe5',
      //         hub: null,
      //         slug: 'impact-of-synchronization-offsets-and-csi-feedback-delay-in-distributed-mimo-systems',
      //         title:
      //           'Impact of Synchronization Offsets and CSI Feedback Delay in Distributed MIMO Systems',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           'The main challenges of distributed MIMO systems lie in achieving highly accurate synchronization and ensuring the availability of accurate channel state information (CSI) at distributed nodes. This paper analytically examines the effects of synchronization offsets and CSI feedback delays on system capacity, providing insights into how these affect the coherent joint transmission gain. The capacity expressions are first derived under ideal conditions, and the effects of synchronization offsets and feedback delays are subsequently incorporated. This analysis can be applied to any distributed MIMO architecture. A comprehensive study, including system models and simulations evaluating the analytical expressions, is presented to quantify the capacity degradation caused by these factors. This study provides valuable insights into the design and performance of distributed MIMO systems. The analysis shows that time and frequency offsets, along with CSI feedback delay, cause inter-layer interference. Additionally, time offsets result in inter-symbol interference. ',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Bondada',
      //             first_name: 'Kumar Sai',
      //           },
      //           {
      //             last_name: 'Jakubisin',
      //             first_name: 'Daniel',
      //           },
      //           {
      //             last_name: 'Buehrer',
      //             first_name: 'R. Michael',
      //           },
      //         ],
      //         created_date: '2025-04-06T18:40:38.206867Z',
      //       },
      //       created_date: '2025-04-06T18:41:18.931716Z',
      //       action_date: '2025-04-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 5,
      //         replies: 1,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 0,
      //           count: 0,
      //         },
      //       },
      //     },
      //     {
      //       id: 1777879,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9347187,
      //         doi: '10.48550/arxiv.2503.22706',
      //         hub: null,
      //         slug: 'validating-emergency-department-admission-predictions-based-on-local-data-through-mimic-iv',
      //         title:
      //           'Validating Emergency Department Admission Predictions Based on Local Data Through MIMIC-IV',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           'The effective management of Emergency Department (ED) overcrowding is essential for improving patient outcomes and optimizing healthcare resource allocation. This study validates hospital admission prediction models initially developed using a small local dataset from a Greek hospital by leveraging the comprehensive MIMIC-IV dataset. After preprocessing the MIMIC-IV data, five algorithms were evaluated: Linear Discriminant Analysis (LDA), K-Nearest Neighbors (KNN), Random Forest (RF), Recursive Partitioning and Regression Trees (RPART), and Support Vector Machines (SVM Radial). Among these, RF demonstrated superior performance, achieving an Area Under the Receiver Operating Characteristic Curve (AUC-ROC) of 0.9999, sensitivity of 0.9997, and specificity of 0.9999 when applied to the MIMIC-IV data. These findings highlight the robustness of RF in handling complex datasets for admission prediction, establish MIMIC-IV as a valuable benchmark for validating models based on smaller local datasets, and provide actionable insights for improving ED management strategies.',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Meimeti',
      //             first_name: 'Francesca',
      //           },
      //           {
      //             last_name: 'Triantafyllopoulos',
      //             first_name: 'Loukas',
      //           },
      //           {
      //             last_name: 'Sakagianni',
      //             first_name: 'Aikaterini',
      //           },
      //           {
      //             last_name: 'Kaldis',
      //             first_name: 'Vasileios',
      //           },
      //           {
      //             last_name: 'Tzelves',
      //             first_name: 'Lazaros',
      //           },
      //           {
      //             last_name: 'Theodorakis',
      //             first_name: 'Nikolaos',
      //           },
      //           {
      //             last_name: 'Paxinou',
      //             first_name: 'Evgenia',
      //           },
      //           {
      //             last_name: 'Feretzakis',
      //             first_name: 'Georgios',
      //           },
      //           {
      //             last_name: 'Kalles',
      //             first_name: 'Dimitris',
      //           },
      //           {
      //             last_name: 'Verykios',
      //             first_name: 'Vassilios S.',
      //           },
      //         ],
      //         created_date: '2025-04-04T23:33:05.646501Z',
      //       },
      //       created_date: '2025-04-05T01:41:20.880941Z',
      //       action_date: '2025-01-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 7,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 4,
      //           count: 1,
      //         },
      //       },
      //     },
      //     {
      //       id: 1777877,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9347186,
      //         doi: '10.48550/arxiv.2503.22176',
      //         hub: null,
      //         slug: 'a-multi-site-study-on-ai-driven-pathology-detection-and-osteoarthritis-grading-from-knee-x-ray',
      //         title:
      //           'A Multi-Site Study on AI-Driven Pathology Detection and Osteoarthritis Grading from Knee X-Ray',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           'Introduction: Bone health disorders like osteoarthritis and osteoporosis pose major global health challenges, often leading to delayed diagnoses due to limited diagnostic tools. This study presents an AI-powered system that analyzes knee X-rays to detect key pathologies, including joint space narrowing, sclerosis, osteophytes, tibial spikes, alignment issues, and soft tissue anomalies. It also grades osteoarthritis severity, enabling timely, personalized treatment.\n Study Design: The research used 1.3 million knee X-rays from a multi-site Indian clinical trial across government, private, and SME hospitals. The dataset ensured diversity in demographics, imaging equipment, and clinical settings. Rigorous annotation and preprocessing yielded high-quality training datasets for pathology-specific models like ResNet15 for joint space narrowing and DenseNet for osteoarthritis grading.\n Performance: The AI system achieved strong diagnostic accuracy across diverse imaging environments. Pathology-specific models excelled in precision, recall, and NPV, validated using Mean Squared Error (MSE), Intersection over Union (IoU), and Dice coefficient. Subgroup analyses across age, gender, and manufacturer variations confirmed generalizability for real-world applications.\n Conclusion: This scalable, cost-effective solution for bone health diagnostics demonstrated robust performance in a multi-site trial. It holds promise for widespread adoption, especially in resource-limited healthcare settings, transforming bone health management and enabling proactive patient care.',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Subramanian',
      //             first_name: 'Bargava',
      //           },
      //           {
      //             last_name: 'Kumarasami',
      //             first_name: 'Naveen',
      //           },
      //           {
      //             last_name: 'Shastry',
      //             first_name: 'Praveen',
      //           },
      //           {
      //             last_name: 'Sivasailam',
      //             first_name: 'Kalyan',
      //           },
      //           {
      //             last_name: 'D',
      //             first_name: 'Anandakumar',
      //           },
      //           {
      //             last_name: 'R',
      //             first_name: 'Keerthana',
      //           },
      //           {
      //             last_name: 'M',
      //             first_name: 'Mounigasri',
      //           },
      //           {
      //             last_name: 'G',
      //             first_name: 'Abilaasha',
      //           },
      //           {
      //             last_name: 'Venkatesh',
      //             first_name: 'Kishore Prasath',
      //           },
      //         ],
      //         created_date: '2025-04-04T23:31:40.046714Z',
      //       },
      //       created_date: '2025-04-05T01:41:20.559591Z',
      //       action_date: '2025-01-01T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 7,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 3,
      //           count: 1,
      //         },
      //       },
      //     },
      //     {
      //       id: 1784653,
      //       content_type: 'PAPER',
      //       content_object: {
      //         id: 9347173,
      //         doi: '10.1101/2025.03.30.646237',
      //         hub: null,
      //         slug: 'vascular-niches-are-the-primary-hotspots-for-aging-within-the-multicellular-architecture-of-cardiac-tissue',
      //         title:
      //           'Vascular niches are the primary hotspots for aging within the multicellular architecture of cardiac tissue',
      //         authors: [],
      //         journal: null,
      //         abstract:
      //           'Background: Aging is a major, yet unmodifiable risk factor for cardiovascular diseases, leading to vascular alterations, increased cardiac fibrosis, and inflammation, all of which contribute to impaired cardiac function. However, the microenvironment inciting age-related alterations withing the multicellular architecture of the cardiac tissue is unknown. Methods: We investigated local microenvironments in aged mice hearts applying an integrative approach combining single-nucleus RNA sequencing and spatial transcriptomics in 12-week-old and 18-month-old mice. We defined distinct cardiac niches and studied changes in their cellular composition and functional characteristics. Results: Integration of spatial transcriptomics data across young and aged hearts allowed us to identify 11 cardiac niches, which were characterized by distinct cellular composition and functional signatures. Aging did not alter the overall proportions of cardiac niches but leads to distinct regional changes, particularly in the left ventricle. Whereas cardiomyocyte-enriched niches show disrupted circadian clock gene expression, vascular niches showed major changes in pro-inflammatory and pro-fibrotic signatures and altered cellular composition. We particularly identified larger vessel-associated cellular niches as key hotspots for activated fibroblasts and macrophages in aged hearts, with interactions of both cell types through the C3:C3ar1 axis. These niches were also enriched in senescence cells exhibiting high expression of immune evasion mechanisms that may impair senescent cell clearance. Conclusion: Our findings indicate that the microenvironment around the vasculature is particularly susceptible to age-related changes and serves as a primary site for inflammation-driven aging, so called "inflammaging". This study provides new insights into how aging reshapes cardiac cellular architecture, highlighting vessel-associated niches as potential therapeutic targets for age-related cardiac dysfunction.',
      //         bounties: [],
      //         work_type: null,
      //         raw_authors: [
      //           {
      //             last_name: 'Rodriguez Morales',
      //             first_name: 'David',
      //           },
      //           {
      //             last_name: 'Larcher',
      //             first_name: 'Veronica',
      //           },
      //           {
      //             last_name: 'Ruz Jurado',
      //             first_name: 'Mariano',
      //           },
      //           {
      //             last_name: 'Tombor',
      //             first_name: 'Lukas',
      //           },
      //           {
      //             last_name: 'Zanders',
      //             first_name: 'Lukas',
      //           },
      //           {
      //             last_name: 'Wagner',
      //             first_name: 'Julian Uwe Gabriel',
      //           },
      //           {
      //             last_name: 'Zeiher',
      //             first_name: 'Andreas M.',
      //           },
      //           {
      //             last_name: 'Kuppe',
      //             first_name: 'Christoph',
      //           },
      //           {
      //             last_name: 'John',
      //             first_name: 'David',
      //           },
      //           {
      //             last_name: 'Schulz',
      //             first_name: 'Marcel H',
      //           },
      //           {
      //             last_name: 'Dimmeler',
      //             first_name: 'Stefanie',
      //           },
      //         ],
      //         created_date: '2025-04-04T17:38:10.791323Z',
      //       },
      //       created_date: '2025-04-06T20:41:47.900801Z',
      //       action_date: '2025-04-03T00:00:00Z',
      //       action: 'PUBLISH',
      //       author: null,
      //       metrics: {
      //         votes: 6,
      //         replies: 2,
      //         citations: 0,
      //         review_metrics: {
      //           avg: 3,
      //           count: 1,
      //         },
      //       },
      //     },
      //   ],
      // };

      // Transform the raw entries into FeedEntry objects
      const transformedEntries = response.results
        .map((entry) => {
          try {
            return transformFeedEntry(entry);
          } catch (error) {
            console.error('Error transforming feed entry:', error, entry);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => !!entry);

      // Return the transformed entries
      return {
        entries: transformedEntries,
        hasMore: !!response.next,
      };
    } catch (error) {
      console.error('Error fetching feed:', error);
      // Return empty entries on error
      return {
        entries: [],
        hasMore: false,
      };
    }
  }

  // Helper function to transform a raw bounty from the feed API to a Bounty object
  // This is used by the BountyCard component which expects the old Bounty type
  static transformRawBounty(rawBounty: RawApiFeedEntry): Bounty {
    if (!rawBounty) {
      throw new Error('Raw bounty is undefined');
    }

    const { content_object, author, action_date, created_date } = rawBounty;

    if (!content_object) {
      throw new Error('Raw bounty content_object is undefined');
    }

    // Create default author if missing
    const defaultAuthor = {
      id: 0,
      first_name: 'Unknown',
      last_name: 'User',
      profile_image: '',
      description: '',
      user: {
        id: 0,
        first_name: 'Unknown',
        last_name: 'User',
        email: '',
        is_verified: false,
      },
    };

    // Use default author if author is missing
    const safeAuthor = author || defaultAuthor;

    // Transform the author to a User object
    let user;
    try {
      if (safeAuthor.user) {
        user = transformUser(safeAuthor.user);
        user.authorProfile = transformAuthorProfile(safeAuthor);
      } else {
        user = transformUser({
          id: safeAuthor.id,
          email: '',
          first_name: safeAuthor.first_name,
          last_name: safeAuthor.last_name,
          is_verified: false,
          balance: 0,
          author_profile: safeAuthor,
        });
      }
    } catch (error) {
      console.error('Error transforming user:', error);
      // Fallback to manual transformation
      user = {
        id: safeAuthor.user?.id || safeAuthor.id || 0,
        email: safeAuthor.user?.email || '',
        firstName: safeAuthor.first_name || '',
        lastName: safeAuthor.last_name || '',
        fullName:
          `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
        isVerified: safeAuthor.user?.is_verified || false,
        balance: 0,
        authorProfile: {
          id: safeAuthor.id || 0,
          fullName:
            `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
          profileImage: safeAuthor.profile_image || '',
          headline: safeAuthor.description || '',
          profileUrl: `/profile/${safeAuthor.id || 0}`,
          user: {
            id: safeAuthor.user?.id || safeAuthor.id || 0,
            email: safeAuthor.user?.email || '',
            firstName: safeAuthor.first_name || '',
            lastName: safeAuthor.last_name || '',
            fullName:
              `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() ||
              'Unknown User',
            isVerified: safeAuthor.user?.is_verified || false,
            balance: 0,
          },
          isClaimed: !!safeAuthor.user,
        },
      };
    }

    // Map bounty_type to BountyType
    const bountyTypeMap: Record<string, BountyType> = {
      REVIEW: 'REVIEW',
      ANSWER: 'ANSWER',
      BOUNTY: 'BOUNTY',
      GENERIC_COMMENT: 'GENERIC_COMMENT',
    };

    // Get the bounty type, defaulting to 'BOUNTY' if not found
    const bountyType =
      content_object.bounty_type && bountyTypeMap[content_object.bounty_type]
        ? bountyTypeMap[content_object.bounty_type]
        : 'BOUNTY';

    // Create a Bounty object from the feed entry
    return {
      id: content_object.id,
      amount: (content_object.amount || 0).toString(),
      status: content_object.status || 'OPEN',
      expirationDate: content_object.expiration_date || new Date().toISOString(),
      bountyType,
      createdBy: user,
      solutions: [],
      contributions: [],
      totalAmount: (content_object.amount || 0).toString(),
      raw: {
        ...content_object,
        created_date: created_date || new Date().toISOString(),
        action_date: action_date || new Date().toISOString(),
        author: safeAuthor,
        hub: content_object.hub || { name: 'Unknown', slug: 'unknown' },
        paper: content_object.paper || null,
      },
    };
  }

  // Helper function to transform a raw fundraise from the feed API to a Fundraise object
  static transformRawFundraise(rawFundraise: RawApiFeedEntry): Fundraise {
    if (!rawFundraise) {
      throw new Error('Raw fundraise is undefined');
    }

    const { content_object } = rawFundraise;

    if (!content_object) {
      throw new Error('Raw fundraise content_object is undefined');
    }

    // Create a raw format expected by the transformer
    const formattedRawFundraise = {
      id: content_object.id,
      status: content_object.status,
      goal_currency: content_object.goal_currency,
      goal_amount: {
        usd: content_object.goal_amount?.usd || 0,
        rsc: content_object.goal_amount?.rsc || 0,
      },
      amount_raised: {
        usd: content_object.amount_raised?.usd || 0,
        rsc: content_object.amount_raised?.rsc || 0,
      },
      start_date: content_object.start_date,
      end_date: content_object.end_date,
      contributors: {
        total: content_object.contributors?.total || 0,
        top: (content_object.contributors?.top || []).map((contributor: any) => ({
          author_profile: contributor.author_profile,
        })),
      },
      created_date: content_object.created_date,
      updated_date: content_object.updated_date,
    };

    return transformFundraise(formattedRawFundraise);
  }
}
