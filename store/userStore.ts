import { User } from '@/types/user';

export const users: Record<string, User> = {
    researchHub: {
      id: 1,
      email: 'contact@researchhub.org',
      fullName: 'ResearchHub Foundation',
      isVerified: true,
      isOrganization: true,
      authorProfile: {
        id: 1,
        profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob",
        headline: "Decentralized Research Platform"
      }
    },
    dominikus: {
      id: 2,
      email: 'dominikus@example.com',
      fullName: 'Dominikus Brian',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 2,
        profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/19/blob",
        headline: "Research Scientist"
      }
    },
    bioRxiv: {
      id: 3,
      email: 'contact@biorxiv.org',
      fullName: 'bioRxiv (Cold Spring Harbor Laboratory)',
      isVerified: true,
      isOrganization: true,
      authorProfile: {
        id: 3,
        profileImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh0mIPhY2F4yEhtpWJERf0sCvfaPwyUieCkVfg6aS8acUqZ7f5v21HNlFxEtHmtCQYFSXdX97Y7HiZd7pedBXfL2oTlj1NnaEwpwWQKXOLHwt7tp18djNgKdF3sKNE8bhIrTUiE/s0/lwyH1HFe_400x400.jpg",
        headline: "Preprint Server for Biology"
      }
    },
    adamDraper: {
      id: 4,
      email: 'adam@example.com',
      fullName: 'Adam Draper',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 4,
        profileImage: 'https://pbs.twimg.com/profile_images/1547324187588538370/tKLmbxhc_400x400.jpg',
        headline: "Research Fellow"
      }
    },
    elenaRodriguez: {
      id: 5,
      email: 'elena@example.com',
      fullName: 'Dr. Elena Rodriguez',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 5,
        profileImage: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/26/blob_TgYbKAo',
        headline: "Principal Investigator"
      }
    },
    hundessaNemomssa: {
      id: 6,
      email: 'hundessa@example.com',
      fullName: 'Hundessa Nemomssa',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 6,
        profileImage: "https://lh3.googleusercontent.com/a/ACg8ocJj0QP51OML0cy6qsoKezhVqHB96qVEBEMtlWY2Jhc8xWvWIjY=s96-c",
        headline: "Research Associate"
      }
    },
    alexThompson: {
      id: 7,
      email: 'alex@example.com',
      fullName: 'Alex Thompson',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 7,
        profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/17/blob_mXZ6zDF",
        headline: "Data Scientist"
      }
    },
    sarahChen: {
      id: 8,
      email: 'sarah@example.com',
      fullName: 'Sarah Chen',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 8,
        profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/25/blob_7T1yCOe",
        headline: "ML Researcher"
      }
    },
    mariaGarcia: {
      id: 9,
      email: 'maria@example.com',
      fullName: 'Maria Garcia',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 9,
        profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/17/blob_F2VhiHh",
        headline: "Research Fellow"
      }
    },
    davidKumar: {
      id: 10,
      email: 'david@example.com',
      fullName: 'David Kumar',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 10,
        profileImage: "https://lh3.googleusercontent.com/a-/AOh14GiRKX1-3CxehVa8k35yT8n3E3kUUctMHuWEGhoJ6A=s96-c",
        headline: "Research Scientist"
      }
    },
    jamesWilson: {
      id: 11,
      email: 'james@example.com',
      fullName: 'James Wilson',
      isVerified: false,
      isOrganization: false,
      authorProfile: {
        id: 11,
        profileImage: "https://lh3.googleusercontent.com/a/ACg8ocKjrm4IKJD-j0EBm_l6Dq3e-9k6UG9Cw4LYeqvY2ivA1B69f4fE=s96-c",
        headline: "PhD Candidate"
      }
    },
    mariaPatel: {
      id: 12,
      email: 'mariap@example.com',
      fullName: 'Maria Patel',
      isVerified: true,
      isOrganization: false,
      authorProfile: {
        id: 12,
        profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/13/blob_eu0M5yn",
        headline: "Research Associate"
      }
    },
    stanfordAILab: {
      id: 13,
      email: 'ai@stanford.edu',
      fullName: 'Stanford AI Lab',
      isVerified: true,
      isOrganization: true,
      authorProfile: {
        id: 13,
        profileImage: "https://pbs.twimg.com/profile_images/875395483128049664/8z_jvdLB_400x400.jpg",
        headline: "AI Research Lab"
      }
    },
    climateResearchInstitute: {
      id: 14,
      email: 'contact@climate-research.org',
      fullName: 'Climate Research Institute',
      isVerified: true,
      isOrganization: true,
      authorProfile: {
        id: 14,
        profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2023/09/16/blob",
        headline: "Climate Science Research"
      }
    },
    openBiologyInitiative: {
      id: 15,
      email: 'contact@obi.org',
      fullName: 'Open Biology Initiative',
      isVerified: true,
      isOrganization: true,
      authorProfile: {
        id: 15,
        profileImage: "https://cdn-icons-png.flaticon.com/256/525/525916.png",
        headline: "Open Science Organization"
      }
    },
    nationalScienceFoundation: {
      id: 16,
      email: 'contact@nsf.gov',
      fullName: 'National Science Foundation',
      isVerified: true,
      isOrganization: true,
      authorProfile: {
        id: 16,
        profileImage: "https://pbs.twimg.com/profile_images/1476237803763773447/bL1_CQLe_400x400.jpg",
        headline: "Federal Research Agency"
      }
    }
};
  
  