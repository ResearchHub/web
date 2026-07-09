import { ApiClient } from './client';
import { ActivityService, type GetActivityParams } from './activity.service';
import { FunderOverview, transformFunderOverview } from '@/types/funder';
import type { FeedEntry } from '@/types/feed';

export class FunderService {
  private static readonly BASE_PATH = '/api/funder';

  static async getFundingOverview(userId?: number): Promise<FunderOverview> {
    const query = userId ? `?user_id=${userId}` : '';
    // const response = await ApiClient.get<any>(`${this.BASE_PATH}/funding_overview/${query}`);
    const response = {
      matched_funds: {
        rsc: 66258.74,
        rsc_usd_snapshot: 5356,
        usd: 0,
      },
      distributed_funds: {
        rsc: 890538.34,
        rsc_usd_snapshot: 175792.66,
        usd: 0,
      },
      supported_proposals: [
        {
          unified_document: {
            id: 1551307,
            title:
              'Improving Disimpy to Accelerate Simulation-Driven Microstructural Neuroimaging Research',
            slug: 'improving-disimpy-to-accelerate-simulation-driven-microstructural-neuroimaging-research',
          },
          id: 1470,
          created_by: {
            id: 39736,
            author_profile: {
              id: 974000,
              first_name: 'Leevi',
              last_name: 'Kerkelä',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/04/02/blob_eyJPgTJ',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 733.79,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 1637418,
            title:
              'Leveraging AlphaMissense to predict the functional effects of transcription errors in coding RNA',
            slug: 'leveraging-alphamissense-to-predict-the-functional-effects-of-transcription-errors-in-coding-rna',
          },
          id: 1538,
          created_by: {
            id: 42466,
            author_profile: {
              id: 976291,
              first_name: 'Mark',
              last_name: 'Handley',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/02/01/blob_uMlwPoX',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 726.93,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 1637462,
            title:
              'DNA Tetrahedra-Lipids Complex Design Optimization for Efficient Blood-Brain Barrier Cellular Uptake',
            slug: 'dna-tetrahedra-lipids-complex-design-optimization-for-efficient-blood-brain-barrier-cellular-uptake',
          },
          id: 1540,
          created_by: {
            id: 51717,
            author_profile: {
              id: 985065,
              first_name: 'Grigorii',
              last_name: 'Rudakov',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/02/02/blob',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 725.82,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4077342,
            title:
              'Reproducibility Made Easy: A Tool for Transparent and Standardized Reporting of Magnetic Resonance Spectroscopy Methods',
            slug: 'reproducibility-made-easy-a-tool-for-transparent-and-standardized-reporting-of-magnetic-resonance-spectroscopy-methods',
          },
          id: 1563,
          created_by: {
            id: 51680,
            author_profile: {
              id: 985028,
              first_name: 'Antonia',
              last_name: 'Susnjar',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/01/18/blob_sNk0yf5',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 727.77,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4077429,
            title:
              'Multisensory integration for human detection of abnormalities during active steering',
            slug: 'multisensory-integration-for-human-detection-of-abnormalities-during-active-steering',
          },
          id: 1580,
          created_by: {
            id: 36725,
            author_profile: {
              id: 956487,
              first_name: 'Brandon',
              last_name: 'Rasman',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/04/blob_SbN4i7P',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 727.66,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4077455,
            title: 'Evaluating c-Myc gene regulation of PIM2 in Multiple Myeloma',
            slug: 'evaluating-c-myc-gene-regulation-of-pim2-in-multiple-myeloma',
          },
          id: 1584,
          created_by: {
            id: 50923,
            author_profile: {
              id: 984330,
              first_name: 'Christopher',
              last_name: 'Schorr',
              profile_image:
                'https://lh3.googleusercontent.com/a/ACg8ocKMS5Vxhj8AS-FHWLmrLlHb053ag6bKs4_PCeMw8RPqenup=s96-c',
            },
          },
          funded_amount: {
            rsc: 5000,
            rsc_usd_snapshot: 1481.23,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4383853,
            title:
              'Cross-Disease Modeling Approach to Identify Biological Pathways Shared Between Alzheimer’s Disease and Type 2 Diabetes',
            slug: 'cross-disease-modeling-approach-to-identify-biological-pathways-shared-between-alzheimers-disease-and-type-2-diabetes',
          },
          id: 1941,
          created_by: {
            id: 38051,
            author_profile: {
              id: 964357,
              first_name: 'Brendan',
              last_name: 'Ball',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/05/08/blob_7WE8vqq',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 1509.67,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4383854,
            title:
              'Mast cell-induced B-cell class switching regulates CNS immunoglobulin diversity during postnatal brain development',
            slug: 'mast-cell-induced-b-cell-class-switching-regulates-cns-immunoglobulin-diversity-during-postnatal-brain-development',
          },
          id: 1942,
          created_by: {
            id: 43867,
            author_profile: {
              id: 977571,
              first_name: 'Matthew',
              last_name: 'Bruce',
              profile_image:
                'https://lh3.googleusercontent.com/a/ACg8ocJfTXlysgRkUIegX8xnKMCjUog4HqF83_Gh5faQo-2g870g=s96-c',
            },
          },
          funded_amount: {
            rsc: 2538,
            rsc_usd_snapshot: 1539.14,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4383857,
            title:
              'The Extracellular Matrix Aging Atlas: a knowledgebase of time-resolved matrisome signatures extracted from public proteomic datasets—a proposal',
            slug: 'the-extracellular-matrix-aging-atlas-a-knowledgebase-of-time-resolved-matrisome-signatures-extracted-from-public-proteomic-datasets',
          },
          id: 1943,
          created_by: {
            id: 33069,
            author_profile: {
              id: 930627,
              first_name: 'Rakhan',
              last_name: 'Aimbetov',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/10/blob',
            },
          },
          funded_amount: {
            rsc: 2523,
            rsc_usd_snapshot: 1527.5,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4468964,
            title:
              'ATHENA Project: Advanced Tracking for Health and Enhanced Athletic Performance in Female Athletes',
            slug: 'athena-project-advanced-tracking-for-health-and-enhanced-athletic-performance-in-female-athletes',
          },
          id: 2103,
          created_by: {
            id: 60477,
            author_profile: {
              id: 993550,
              first_name: 'Sam',
              last_name: 'Moore',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/25/blob_ntPTo6M',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 1173.15,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 4487511,
            title: 'Impact of PCOS status on ovulatory and metabolic changes with weight loss',
            slug: 'impact-of-pcos-status-on-ovulatory-and-metabolic-changes-with-weight-loss',
          },
          id: 2126,
          created_by: {
            id: 60412,
            author_profile: {
              id: 993490,
              first_name: 'Bailey',
              last_name: 'Smith',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/05/07/blob_48esqmw',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 1173.15,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 5065766,
            title: 'Airways to Alteration',
            slug: 'breathworklab-x-researchhub',
          },
          id: 3151,
          created_by: {
            id: 39779,
            author_profile: {
              id: 974040,
              first_name: 'Guy W.',
              last_name: 'Fincham, PhD',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
            },
          },
          funded_amount: {
            rsc: 16500,
            rsc_usd_snapshot: 4583.31,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 5781929,
            title:
              'Incentivized vs Non-Incentivized Open Peer Reviews : Dynamics, Economics, and Quality',
            slug: 'incentivized-vs-non-incentivized-open-peer-reviews-dynamics-economics-and-quality',
          },
          id: 3170,
          created_by: {
            id: 60018,
            author_profile: {
              id: 993107,
              first_name: 'Dominikus',
              last_name: 'Brian',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
            },
          },
          funded_amount: {
            rsc: 25000,
            rsc_usd_snapshot: 5753.65,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7345202,
            title:
              'ARTEMIS - Automated Review and Trustworthy Evaluation for Manuscripts in Science<br>',
            slug: 'artemis-automated-review-and-trustworthy-evaluation-for-manuscripts-in-sciencebr',
          },
          id: 3961,
          created_by: {
            id: 60018,
            author_profile: {
              id: 993107,
              first_name: 'Dominikus',
              last_name: 'Brian',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
            },
          },
          funded_amount: {
            rsc: 2500,
            rsc_usd_snapshot: 927.48,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7421932,
            title: 'Changes in circuits of motivation following fentanyl addiction',
            slug: 'changes-in-circuits-of-motivation-following-fentanyl-addiction',
          },
          id: 4032,
          created_by: {
            id: 115327,
            author_profile: {
              id: 7677639,
              first_name: 'Jason',
              last_name: 'Tucciarone',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/05/blob',
            },
          },
          funded_amount: {
            rsc: 25000,
            rsc_usd_snapshot: 6235.58,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7458639,
            title: 'Energy Healing Brain Hyper Scanning in Fibromyalgia',
            slug: 'energy-healing-brain-hyper-scanning-in-fibromyalgia',
          },
          id: 4082,
          created_by: {
            id: 115871,
            author_profile: {
              id: 7737825,
              first_name: 'Richard',
              last_name: 'Harris',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 82090,
            rsc_usd_snapshot: 20852.33,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7470132,
            title:
              'Blindfold Perception in Children: An Empirical Investigation into the Activation and Development',
            slug: 'blindfold-perception-in-children-an-empirical-investigation-into-the-activation-and-development',
          },
          id: 4085,
          created_by: {
            id: 113017,
            author_profile: {
              id: 7589753,
              first_name: 'Dr. Edith',
              last_name: 'Chan',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/22/blob_Z1Fw4Vh',
            },
          },
          funded_amount: {
            rsc: 20000,
            rsc_usd_snapshot: 6040.71,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7472339,
            title: 'DeSci Fellowship x BreathworkLab',
            slug: 'breathworklab-desci-fellowship',
          },
          id: 4086,
          created_by: {
            id: 39779,
            author_profile: {
              id: 974040,
              first_name: 'Guy W.',
              last_name: 'Fincham, PhD',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
            },
          },
          funded_amount: {
            rsc: 36000,
            rsc_usd_snapshot: 21636.26,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7478464,
            title:
              'Title: Investigating the Neural and Cerebrovascular Effects of the Wim Hof Breathing Technique: Implications for Glymphatic Function and Brain Waste Clearance',
            slug: 'title-investigating-the-neural-and-cerebrovascular-effects-of-the-wim-hof-breathing-technique-implications-for-glymphatic-function-and-brain-waste-clearance',
          },
          id: 4094,
          created_by: {
            id: 116371,
            author_profile: {
              id: 7766068,
              first_name: 'Fadel',
              last_name: 'Zeidan',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 25000,
            rsc_usd_snapshot: 7550.89,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7478465,
            title:
              'Untargeted Metabolomics, Antioxidant Capacity, and Total Phenolic Content of Honey produced by Apis mellifera in Guam and Okinawa',
            slug: 'untargeted-metabolomics-antioxidant-capacity-and-total-phenolic-content-of-honey-produced-by',
          },
          id: 4095,
          created_by: {
            id: 49105,
            author_profile: {
              id: 982634,
              first_name: 'Shashikant',
              last_name: 'Kotwal',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/27/blob_bvG0QSu',
            },
          },
          funded_amount: {
            rsc: 1000,
            rsc_usd_snapshot: 302.04,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7480565,
            title:
              'Neuromodulation of Color Change in Panther Chameleons: A New Animal Model of Behavior and Psychoactive Drug Action',
            slug: 'neuromodulation-of-color-change-in-panther-chameleons-a-new-animal-model-of-behavior-and-psychoactive-drug-action',
          },
          id: 4128,
          created_by: {
            id: 116520,
            author_profile: {
              id: 7767847,
              first_name: 'Nicholas',
              last_name: 'Denomme',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/05/06/blob_pPc3mTy',
            },
          },
          funded_amount: {
            rsc: 5000,
            rsc_usd_snapshot: 2065.48,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7480619,
            title:
              'Emergent Models: a general modeling framework as an alternative to Neural Networks',
            slug: 'emergent-models-a-general-modeling-framework-as-an-alternative-to-neural-networks',
          },
          id: 4130,
          created_by: {
            id: 115346,
            author_profile: {
              id: 7677667,
              first_name: 'Giacomo',
              last_name: 'Bocchese',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/09/blob_vKN58lt',
            },
          },
          funded_amount: {
            rsc: 5000,
            rsc_usd_snapshot: 2036.76,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7492550,
            title:
              'Elucidating the Toxicity and Energetic Signatures of DMT and its Analogs at Serotonin Receptors: A Quantum Biochemistry-Guided Approach for Therapeutic Innovation and Human Potential',
            slug: 'elucidating-the-toxicity-and-energetic-signatures-of-dmt-and-its-analogs-at-serotonin-receptors-a-quantum-biochemistry-guided-approach-for-therapeutic-innovation-and-human-potential',
          },
          id: 4197,
          created_by: {
            id: 120616,
            author_profile: {
              id: 7782259,
              first_name: 'Jonas',
              last_name: 'Oliveira',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/08/blob',
            },
          },
          funded_amount: {
            rsc: 500,
            rsc_usd_snapshot: 242.75,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7505072,
            title:
              'Real-World Validation of Big Omics-Powered AI Drug Sensitivity Predictor for Acute Myeloid Leukemia Treatment',
            slug: 'real-world-validation-of-big-omics-powered-ai-drug-sensitivity-predictor-for-acute-myeloid-leukemia-treatment',
          },
          id: 4210,
          created_by: {
            id: 84328,
            author_profile: {
              id: 6487201,
              first_name: 'Qingyu',
              last_name: 'Luo',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/22/blob_AWk4g01',
            },
          },
          funded_amount: {
            rsc: 3000,
            rsc_usd_snapshot: 1166.56,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7505569,
            title: 'Preserving Giant Sequoias: Cloning, Tissue Culture, and Genomic Conservation',
            slug: 'preserving-giant-sequoias-cloning-tissue-culture-and-genomic-conservation',
          },
          id: 4211,
          created_by: {
            id: 179435,
            author_profile: {
              id: 7874469,
              first_name: 'Jesse',
              last_name: 'Ketchum',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/02/blob_isK9rea',
            },
          },
          funded_amount: {
            rsc: 1500,
            rsc_usd_snapshot: 680.28,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7520261,
            title: 'Effects of Neuromodulatory Stimulation on Endogenous Psychedelics',
            slug: 'effects-of-neuromodulatory-stimulation-on-endogenous-psychedelics',
          },
          id: 4221,
          created_by: {
            id: 179449,
            author_profile: {
              id: 7874489,
              first_name: 'John',
              last_name: 'Gray',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/02/blob_9gQ9vds',
            },
          },
          funded_amount: {
            rsc: 1000,
            rsc_usd_snapshot: 487.87,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7524049,
            title:
              'Advanced Biomarker and Computational Strategies for Precision Medicine in Alzheimer’s Disease',
            slug: 'llm-and-intelligent-ml-based-precise-integration-for-drug-discovery-in-alzheimers-disease',
          },
          id: 4226,
          created_by: {
            id: 110124,
            author_profile: {
              id: 7150259,
              first_name: 'Gopi',
              last_name: 'Battineni',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/06/blob_a6WQNjh',
            },
          },
          funded_amount: {
            rsc: 500,
            rsc_usd_snapshot: 200.63,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7534546,
            title: 'Effects of psilocybin and related compounds on neuroprotection in human stroke',
            slug: 'effects-of-psilocybin-and-related-compounds-on-neuroprotection-in-human-stroke',
          },
          id: 4261,
          created_by: {
            id: 73794,
            author_profile: {
              id: 4945925,
              first_name: 'Ruslan',
              last_name: 'Rust',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/17/blob_UbuEj4i',
            },
          },
          funded_amount: {
            rsc: 1600,
            rsc_usd_snapshot: 1067.08,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7534611,
            title:
              'NeuroSC: Leveraging Pretrained Single-Cell Models for Brain Cell Classification',
            slug: 'neurosc-leveraging-pretrained-single-cell-models-for-brain-cell-classification',
          },
          id: 4262,
          created_by: {
            id: 80829,
            author_profile: {
              id: 6321429,
              first_name: 'Duy',
              last_name: 'Pham',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/28/blob_jTai1WN',
            },
          },
          funded_amount: {
            rsc: 1700,
            rsc_usd_snapshot: 1112.75,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7535353,
            title: 'Comprehensive analysis of organic contaminants in urban tap water',
            slug: 'comprehensive-analysis-of-organic-contaminants-in-urban-tap-water',
          },
          id: 4271,
          created_by: {
            id: 146819,
            author_profile: {
              id: 7818260,
              first_name: 'Zhenyu',
              last_name: 'Tian',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/17/blob_lOI7OXF',
            },
          },
          funded_amount: {
            rsc: 5000,
            rsc_usd_snapshot: 3328.72,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7555381,
            title: 'A New Kind of Science Organization',
            slug: 'a-new-kind-of-science-organization',
          },
          id: 4300,
          created_by: {
            id: 115233,
            author_profile: {
              id: 7671855,
              first_name: 'James',
              last_name: 'Wiles',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/02/blob_951mEGs',
            },
          },
          funded_amount: {
            rsc: 2200,
            rsc_usd_snapshot: 1072.55,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7555591,
            title:
              '    Accelerating What We Know About OCD:    From Genes to Mice to Better Treatments',
            slug: 'accelerating-what-we-know-about-ocd-from-genes-to-mice-to-better-treatments',
          },
          id: 4309,
          created_by: {
            id: 179364,
            author_profile: {
              id: 7873752,
              first_name: 'Robyn St.',
              last_name: 'Laurent',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 5000,
            rsc_usd_snapshot: 3328.72,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7555781,
            title: 'Role and Mechanism of MDK in Promoting Vascular Mimicry in Breast Cancer',
            slug: 'role-and-mechanism-of-mdk-in-promoting-vascular-mimicry-in-breast-cancer',
          },
          id: 4312,
          created_by: {
            id: 180838,
            author_profile: {
              id: 7964026,
              first_name: 'Bin',
              last_name: 'Sheng',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 1000,
            rsc_usd_snapshot: 610.01,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7635747,
            title:
              'Assessment of unregulated drinking water risks in U.S. tap water using non-targeted Total Organic Halogen (TOX) analysis',
            slug: 'assessment-of-unregulated-drinking-water-risks-in-us-tap-water-using-non-targeted-total-organic-halogen-tox-analysis',
          },
          id: 4372,
          created_by: {
            id: 181207,
            author_profile: {
              id: 7967812,
              first_name: 'Riley',
              last_name: 'Mulhern',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/10/16/blob',
            },
          },
          funded_amount: {
            rsc: 30000,
            rsc_usd_snapshot: 10229.72,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7636065,
            title: 'Fix the Formula – Test Infant Formula for Nutrients and Contaminants',
            slug: 'fix-the-formula-test-infant-formula-for-nutrients-and-contaminants',
          },
          id: 4389,
          created_by: {
            id: 181650,
            author_profile: {
              id: 8113295,
              first_name: 'Julia',
              last_name: 'Lipton',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/08/blob_AiIiYJ9',
            },
          },
          funded_amount: {
            rsc: 5000,
            rsc_usd_snapshot: 2611.46,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7636714,
            title:
              'Quantifying the Cognitive and Neurobiological Processes Underlying Remote Viewing',
            slug: 'quantifying-the-cognitive-and-neurobiological-processes-underlying-remote-viewing',
          },
          id: 4429,
          created_by: {
            id: 56486,
            author_profile: {
              id: 989685,
              first_name: 'Faye',
              last_name: 'McKenna',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
            },
          },
          funded_amount: {
            rsc: 5000,
            rsc_usd_snapshot: 1135.54,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 7684854,
            title:
              'Wim Hof Method Breathwork and Cold Exposure for Cancer-Related Inflammation: Feasibility Pilot',
            slug: 'researchhub-proposal-wim-hof-method-whm-cold-exposure-for-cancer-instructor-guided-citizen-pilot',
          },
          id: 4459,
          created_by: {
            id: 179967,
            author_profile: {
              id: 7908753,
              first_name: 'Jim',
              last_name: 'Nasr',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/10/13/blob',
            },
          },
          funded_amount: {
            rsc: 10098.34,
            rsc_usd_snapshot: 1001,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 8054720,
            title: 'Identifying exposome drivers of age-associated low-grade inflammation',
            slug: 'identifying-exposome-drivers-of-age-associated-low-grade-inflammation',
          },
          id: 4528,
          created_by: {
            id: 183157,
            author_profile: {
              id: 8182397,
              first_name: 'Maximilien',
              last_name: 'Franck',
              profile_image:
                'https://lh3.googleusercontent.com/a/ACg8ocKbYwwQcuGAkCL8hsHM6VGKvgvXG0AcCosR0T5mP-3CyR3oZRlX=s96-c',
            },
          },
          funded_amount: {
            rsc: 7640,
            rsc_usd_snapshot: 1221.23,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 8704817,
            title:
              'De Novo Protein Binder Design for Advanced Glycation End Products: A Computational Approach to Targeting Age-Related Glycative Damage',
            slug: 'de-novo-protein-binder-design-for-targeting-age-related-glycative-damage',
          },
          id: 5094,
          created_by: {
            id: 29831,
            author_profile: {
              id: 752240,
              first_name: 'Kejun',
              last_name: 'Ying',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/12/blob_h5Ci0If',
            },
          },
          funded_amount: {
            rsc: 243.87,
            rsc_usd_snapshot: 25,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 8997297,
            title: 'Chronic ELF-EMF Exposure and Tendon Injury Susceptibility',
            slug: 'chronic-elf-emf-exposure-and-tendon-injury-susceptibility',
          },
          id: 5468,
          created_by: {
            id: 185760,
            author_profile: {
              id: 8559635,
              first_name: 'Chi Hwan',
              last_name: 'Lee',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 260491.4,
            rsc_usd_snapshot: 24943,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9000126,
            title:
              'Evaluation of voltage gated calcium channel activity as a mechanism for ELF-EMF induced tendon injury susceptibility',
            slug: 'evaluation-of-voltage-gated-calcium-channel-activity-as-a-mechanism-for-elf-emf-induced-tendon-injury-susceptibility',
          },
          id: 5514,
          created_by: {
            id: 185764,
            author_profile: {
              id: 8559713,
              first_name: 'Hong-Anh',
              last_name: 'Nguyen',
              profile_image:
                'https://lh3.googleusercontent.com/a/ACg8ocJzcfYE8MP2EtqoTSLZ93Ji1bLWhHRkP3YTcZ7xYfcNA1644QPe=s96-c',
            },
          },
          funded_amount: {
            rsc: 10716.81,
            rsc_usd_snapshot: 1010,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9011034,
            title:
              'A Plant-Based Diet to Improve Vascular Function and Atherosclerosis-Related Biomarkers in Coronary Artery Disease (CAD): Mechanistic Insights from Redox-Inflammation Multi-Omics',
            slug: 'a-plant-based-diet-to-improve-vascular-function-and-atherosclerosis-related-biomarkers-in-coronary-artery-disease-cad-mechanistic-insights-from-redox-inflammation-multi-omics',
          },
          id: 5717,
          created_by: {
            id: 66248,
            author_profile: {
              id: 1872065,
              first_name: 'Rami',
              last_name: 'Najjar',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/26/blob_hUd1uMM',
            },
          },
          funded_amount: {
            rsc: 2522.06,
            rsc_usd_snapshot: 250,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9036584,
            title: 'Advancing Model Interpretability for Drug Discovery using VSA Explainer',
            slug: 'advancing-model-interpretability-for-drug-discovery-using-vsa-explainer',
          },
          id: 11606,
          created_by: {
            id: 185948,
            author_profile: {
              id: 8561041,
              first_name: 'Lucas',
              last_name: 'Attia',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/27/blob_5DrqqlM',
            },
          },
          funded_amount: {
            rsc: 1283.13,
            rsc_usd_snapshot: 97.05,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9042605,
            title:
              'Network Analysis of Neural Subsystems to Assess Consciousness, Cognition, and Ethical Implications',
            slug: 'network-analysis-of-neural-subsystems-to-assess-consciousness-cognition-and-ethical-implications',
          },
          id: 13665,
          created_by: {
            id: 187008,
            author_profile: {
              id: 8573774,
              first_name: 'Chris',
              last_name: 'Tapo',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/02/blob_13ARKYY',
            },
          },
          funded_amount: {
            rsc: 980.07,
            rsc_usd_snapshot: 100,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9055924,
            title:
              'A Parallel 3D-MEA Closed-Loop Chemogenetic Platform to Restore Network Computation in Disease-Modeled Assembloids',
            slug: 'a-parallel-3d-mea-closed-loop-chemogenetic-platform-to-restore-network-computation-in-disease-modeled-assembloids',
          },
          id: 16629,
          created_by: {
            id: 187527,
            author_profile: {
              id: 8575403,
              first_name: 'Sara',
              last_name: 'Mirsadeghi',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/05/blob_qWBGNHU',
            },
          },
          funded_amount: {
            rsc: 5686.09,
            rsc_usd_snapshot: 500,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9082163,
            title: 'Electromagnetic Fields and Soft Tissue Injury Susceptibility',
            slug: 'electromagnetic-fields-and-soft-tissue-injury-susceptibility',
          },
          id: 25383,
          created_by: {
            id: 188629,
            author_profile: {
              id: 8576887,
              first_name: 'Peter',
              last_name: 'Cowan',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/16/blob_6bsrCxP',
            },
          },
          funded_amount: {
            rsc: 89361.53,
            rsc_usd_snapshot: 8287,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9084935,
            title:
              'Functional Capacity of the Gorilla Gut Microbiome: Linking Metabolic Pathways to Pneumatosis Intestinalis via Nanopore Shotgun Metagenomics',
            slug: 'functional-capacity-of-the-gorilla-gut-microbiome-linking-metabolic-pathways-to-pneumatosis-intestinalis-via-nanopore-shotgun-metagenomics',
          },
          id: 26127,
          created_by: {
            id: 179738,
            author_profile: {
              id: 7901811,
              first_name: 'Christopher',
              last_name: 'Dutton',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/27/blob_t7Ju85M',
            },
          },
          funded_amount: {
            rsc: 4742.47,
            rsc_usd_snapshot: 502,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9120038,
            title:
              'Megalithic Geopolymer Studies: Experimental Replication, Characterization, and Feasibility of Low-Temperature Alkali-Silicate Stone Formation',
            slug: 'megalithic-geopolymer-studies-experimental-replication-characterization-and-feasibility-of-low-temperature-alkali-silicate-stone-formation',
          },
          id: 32055,
          created_by: {
            id: 191472,
            author_profile: {
              id: 8586369,
              first_name: 'Narayanan',
              last_name: 'Neithalath',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 32854.68,
            rsc_usd_snapshot: 5050,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9129787,
            title: 'DeSci Fellowship x BreathworkLab: Year 2',
            slug: 'desci-fellowship-x-breathworklab-year-2',
          },
          id: 32061,
          created_by: {
            id: 39779,
            author_profile: {
              id: 974040,
              first_name: 'Guy W.',
              last_name: 'Fincham, PhD',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
            },
          },
          funded_amount: {
            rsc: 20000.65,
            rsc_usd_snapshot: 1500,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9131904,
            title:
              'Inflammatory spread from neurons to whole body in a fly model of amyotrophic lateral sclerosis (ALS)',
            slug: 'inflammatory-spread-from-neurons-to-whole-body-in-a-fly-model-of-amyotrophic-lateral-sclerosis-als',
          },
          id: 32094,
          created_by: {
            id: 192192,
            author_profile: {
              id: 8588915,
              first_name: 'Kenan',
              last_name: 'Krakovic',
              profile_image:
                'https://lh3.googleusercontent.com/a/ACg8ocKarj4eM9Cy6_EWRs5u-y0oAjSoiO_CcMzzu1HkDtSagCqvyw=s96-c',
            },
          },
          funded_amount: {
            rsc: 6218.45,
            rsc_usd_snapshot: 500,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9151321,
            title:
              'A preregistered target-engagement pilot for short peptide myostatin inhibitor candidates',
            slug: 'a-preregistered-pilot-to-validate-short-peptide-myostatin-inhibitors-for-muscle-preservation-and-recovery',
          },
          id: 32123,
          created_by: {
            id: 193717,
            author_profile: {
              id: 8600989,
              first_name: 'Pavel',
              last_name: 'Pravdin',
              profile_image:
                'https://lh3.googleusercontent.com/a/ACg8ocI0_uptV1tDKWIi1ChICDSQ3rWjCgR38hKtRevE_o9bx-7wW7H8lQ=s96-c',
            },
          },
          funded_amount: {
            rsc: 1538.28,
            rsc_usd_snapshot: 200,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9153602,
            title:
              'Experimental Validation of Low-Temperature Alkali Silicate Synthesis and Geopolymer Stone Formation: A Controlled Study of Foti’s Protocol',
            slug: 'experimental-validation-of-low-temperature-alkali-silicate-synthesis-and-geopolymer-stone-formation-a-controlled-study-of-fotis-protocol',
          },
          id: 32125,
          created_by: {
            id: 193936,
            author_profile: {
              id: 8602119,
              first_name: 'Michel',
              last_name: 'Barsoum',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 32020.04,
            rsc_usd_snapshot: 5000,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9162971,
            title:
              "Same Pathway as MOTS-c. Cheaper. Safer. The Brain-Body Imaging Data Just Doesn't Exist Yet",
            slug: 'same-pathway-as-mots-c-cheaper-safer-the-brain-body-imaging-data-just-doesnt-exist-yet',
          },
          id: 32204,
          created_by: {
            id: 56486,
            author_profile: {
              id: 989685,
              first_name: 'Faye',
              last_name: 'McKenna',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
            },
          },
          funded_amount: {
            rsc: 28482.63,
            rsc_usd_snapshot: 2600,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9186008,
            title:
              'Synthesis of Single and Tandem β-Clamp Miniprotein Binder Constructs for Expression and Biochemical Validation',
            slug: 'synthesis-of-single-and-tandem-clamp-miniprotein-binder-constructs-for-expression-and-biochemical-validation',
          },
          id: 32248,
          created_by: {
            id: 82105,
            author_profile: {
              id: 6328170,
              first_name: 'Scott',
              last_name: 'Nelson',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/17/blob_JnhXFUU',
            },
          },
          funded_amount: {
            rsc: 1104.8,
            rsc_usd_snapshot: 100,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9191595,
            title: 'Is it really a geopolymer?',
            slug: 'is-it-really-a-geopolymer',
          },
          id: 32249,
          created_by: {
            id: 195197,
            author_profile: {
              id: 8608504,
              first_name: 'Waltraud M',
              last_name: 'Kriven',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 32020.04,
            rsc_usd_snapshot: 5000,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9220363,
            title:
              'Artificial Antigen-Presenting Cells for EnhancedCAR T Cell Persistence and Anti-Tumor Efficacy',
            slug: 'artificial-antigen-presenting-cells-for-enhancedcar-t-cell-persistence-and-anti-tumor-efficacy',
          },
          id: 32269,
          created_by: {
            id: 197712,
            author_profile: {
              id: 8623136,
              first_name: 'Wenbo',
              last_name: 'Zhang',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 906.88,
            rsc_usd_snapshot: 78.99,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9239362,
            title: 'Resurrecting Ancient DNA Polymerases',
            slug: 'resurrecting-ancient-dna-polymerases',
          },
          id: 32305,
          created_by: {
            id: 82105,
            author_profile: {
              id: 6328170,
              first_name: 'Scott',
              last_name: 'Nelson',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/17/blob_JnhXFUU',
            },
          },
          funded_amount: {
            rsc: 2108.41,
            rsc_usd_snapshot: 222,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9240748,
            title:
              'System Dynamics and Configurational Analysis of UHC Policy Effects on HIV-Related Health Outcomes in Southeast Asia',
            slug: 'system-dynamics-and-configurational-analysis-of-uhc-policy-effects-on-hiv-related-health-outcomes-in-southeast-asia',
          },
          id: 32308,
          created_by: {
            id: 183857,
            author_profile: {
              id: 8336024,
              first_name: 'Jason',
              last_name: 'Hung',
              profile_image:
                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/11/20/blob',
            },
          },
          funded_amount: {
            rsc: 823.72,
            rsc_usd_snapshot: 100.45,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9286728,
            title:
              'Is there a relationship between cortisol and pregnancy loss and what does it mean for preventative care?',
            slug: 'is-there-a-relationship-between-cortisol-and-pregnancy-loss-and-what-does-it-mean-for-preventative-care',
          },
          id: 32337,
          created_by: {
            id: 201713,
            author_profile: {
              id: 8656333,
              first_name: 'Edward',
              last_name: 'Stuart',
              profile_image:
                'https://lh3.googleusercontent.com/a/ACg8ocJwZGr-bMFk5AXkCBk7p2cVB_uUDhVC_bU033VH7zH-d0NsGA=s96-c',
            },
          },
          funded_amount: {
            rsc: 1254.8,
            rsc_usd_snapshot: 100,
            usd: 0,
          },
        },
        {
          unified_document: {
            id: 9301323,
            title:
              'AI-Assisted Emotion Regulation as a Scalable  Neuroplasticity Intervention for Mood Enhancement in Young Adults',
            slug: 'ai-assisted-emotion-regulation-as-a-scalable-neuroplasticity-intervention-for-mood-enhancement-in-young-adults',
          },
          id: 32419,
          created_by: {
            id: 202146,
            author_profile: {
              id: 8665633,
              first_name: 'Richard',
              last_name: 'Lopez',
              profile_image: '',
            },
          },
          funded_amount: {
            rsc: 1288.2,
            rsc_usd_snapshot: 100,
            usd: 0,
          },
        },
      ],
      supported_nonprofits: [
        {
          id: 41,
          name: 'Arizona State University Foundation',
          ein: '866051042',
          endaoment_org_id: '0d7e7174-cd27-49ec-9a05-828d902c9352',
        },
        {
          id: 9,
          name: 'Chancellor Masters and Scholars of the University of Cambridge',
          ein: '131599108',
          endaoment_org_id: 'bc83830d-9e52-49f5-9e7a-35b16ce35f4a',
        },
        {
          id: 42,
          name: 'Drexel University',
          ein: '231352630',
          endaoment_org_id: 'c4b775ad-572f-4e7d-8962-ac79c1c8b211',
        },
        {
          id: 15,
          name: 'Emory University',
          ein: '580566256',
          endaoment_org_id: '6e036b13-65f5-45be-b02b-170fde83f1fe',
        },
        {
          id: 5,
          name: 'FRIENDS OF THE UNIVERSITY OF SUSSEX',
          ein: '311506862',
          endaoment_org_id: 'ca5ded3c-b8b1-4f81-a06b-d5de8223ddf0',
        },
        {
          id: 6,
          name: 'Iowa State University Foundation',
          ein: '421143702',
          endaoment_org_id: 'e1cb16b6-51f3-4a15-a43e-72bb65437221',
        },
        {
          id: 26,
          name: 'Massachusetts Institute Of Tech',
          ein: '042103594',
          endaoment_org_id: 'a1f39421-9df4-4f5c-b4fa-22e2d82dd57a',
        },
        {
          id: 1,
          name: 'Purdue Research Foundation',
          ein: '351052049',
          endaoment_org_id: '0c11d919-1166-4542-81b5-2c4f6c24d261',
        },
        {
          id: 4,
          name: 'RUTGERS UNIVERSITY FOUNDATION',
          ein: '237318742',
          endaoment_org_id: 'd6026047-8de8-4a97-b808-7180558f4cb1',
        },
        {
          id: 2,
          name: 'Stanford University',
          ein: '941156365',
          endaoment_org_id: 'aa6975c3-754d-4775-b06c-268fee313364',
        },
        {
          id: 24,
          name: 'The Neuroimaging Research Lab',
          ein: '394774429',
          endaoment_org_id: 'c14a4e3e-3b10-4686-addc-415c50245b22',
        },
        {
          id: 7,
          name: 'The U C Davis Foundation',
          ein: '946081352',
          endaoment_org_id: 'c18a9368-5c4f-42ab-9c01-313138736a2c',
        },
        {
          id: 40,
          name: 'The University of Texas Foundation Inc',
          ein: '741587488',
          endaoment_org_id: '2f7bde24-786a-4c1b-8084-2033aea62da9',
        },
        {
          id: 10,
          name: 'UC San Diego Foundation',
          ein: '952872494',
          endaoment_org_id: '3b6d07d9-bf3e-42c7-a244-41398d2fbb23',
        },
        {
          id: 25,
          name: 'Universite De Sherbrooke',
          ein: '311490115',
          endaoment_org_id: '3a9b67a1-bfdb-438f-a1dc-b553a7429fc8',
        },
        {
          id: 35,
          name: 'UNIVERSITY OF AKRON FOUNDATION',
          ein: '346575496',
          endaoment_org_id: '12a1fb49-33ac-4222-8695-1dc44a914974',
        },
        {
          id: 14,
          name: 'University of California Irvine Foundation',
          ein: '952540117',
          endaoment_org_id: '6a64c9b3-e66b-4e02-9058-1039587e6dfd',
        },
        {
          id: 17,
          name: 'University of Colorado Foundation',
          ein: '846049811',
          endaoment_org_id: '4c47b0fb-456a-4c47-83bc-a354c0b5a69f',
        },
        {
          id: 38,
          name: 'University of Florida Foundation, Inc.',
          ein: '590974739',
          endaoment_org_id: '5326fd59-0093-41ea-b408-424bcd78fa47',
        },
        {
          id: 43,
          name: 'University of Illinois Foundation',
          ein: '376006007',
          endaoment_org_id: 'a14af71d-c604-4b1e-94e8-fd53fea00451',
        },
        {
          id: 8,
          name: 'University of Southern California',
          ein: '951642394',
          endaoment_org_id: '5755365e-14f5-469e-82cb-0b073f2962e3',
        },
        {
          id: 12,
          name: 'Wolfram Foundation',
          ein: '453729064',
          endaoment_org_id: 'ea588694-7703-43ce-a2af-22871e72984a',
        },
      ],
    };
    return transformFunderOverview(response);
  }

  /**
   * Fetch the activity feed scoped to a single funder
   * (peer reviews, author updates, contributions, etc. across all of their grants).
   * Backed by the activity_feed endpoint with `funder_id` set.
   */
  static async getActivity(
    funderId: number,
    options?: Omit<GetActivityParams, 'funderId'>
  ): Promise<{ entries: FeedEntry[]; hasMore: boolean; count: number }> {
    return ActivityService.getActivity({ ...options, funderId });
  }
}
