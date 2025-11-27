
import { ResumeData, ResumeProfile } from './types';

const BASE_RESUME: ResumeData = {
  personalInfo: {
    name: "刘慧 ",
    gender: "女",
    age: 29,
    phone: "15811172212",
    location: "沈阳",
    hometown: "沈阳",
    height: "172cm",
    weight: "50kg"
  },
  summary: [
    "拥有4年国有银行一线实战经验，熟悉零售业务及柜面流程，熟悉银行理财产品，并持AFP理财师证书。",
    "具备客户服务意识与现场管理能力，擅长引导分流、处理客户咨询与投诉。可同时接待多名客户。",
    "性格乐于助人，注重细节。多次获得客户留言或电话表扬，致力于提升网点服务品质与客户满意度。",
    "曾独立策划并执行数场客户营销活动，具备良好的沟通协调与跨部门协作能力。"
  ],
  education: {
    school: "湖南文理学院",
    degree: "国际经济 | 统招本科",
    duration: "2015.09-2019.06",
    details: [
      "核心课程：国际金融，微观经济学，宏观经济学，货币银行学，市场营销学等",
      "所获荣誉：荣获“校三等奖学金”“全国大学生广告大赛省级优秀奖”"
    ]
  },
  experience: [
    {
      company: "中信银行沈阳分行",
      role: "市场经理 | 银行",
      duration: "2020.12-2024.12",
      details: [
        "大堂运营与客服：负责大堂值班，引导客户分流、处理投诉，保障营业秩序。",
        "新客拓展：通过上门拜访、驻点、电销等方式开拓客户，主导信用卡、个贷等零售业务指标达成。",
        "存量客户运营：提升产品渗透率与客户黏性，推动富裕、贵宾客户增长。",
        "客户教育与咨询：解读存贷理财产品、解决账户问题，借“小小银行家”、反诈宣传等活动普及金融知识。",
        "公私联动：联动公私业务挖掘潜在个人及企业客户。",
        "贷后管理：跟踪个贷客户还款，提高续贷或制定贷款重组方案。",
        "物料与供应商管理：负责营销物料设计制作，跟进供应商交货及入库报账。"
      ]
    }
  ],
  projects: [
    {
      name: "某公司驻点活动",
      role: "执行负责人",
      duration: "2024.01-2024.01",
      description: "开展新春送福驻点营销活动，累计储蓄卡开卡 52 张，信用卡有效卡 25 张。"
    },
    {
      name: "某物业代发项目",
      role: "项目骨干",
      duration: "2023.09-2023.12",
      description: "通过公私联动落地某物业千人代发项目，累计储蓄卡开卡 2853 张，信用卡有效卡 347 张，证券户 191 户。"
    },
    {
      name: "某景点驻点活动",
      role: "执行人员",
      duration: "2023.8-2023.8",
      description: "开展暑假驻点营销活动，累计信用卡有效卡 205 张。"
    }
  ],
  certificates: [
    "AFP 理财师证书",
    "银行优秀新行员",
    "银行协同精英",
    "计算机二级",
    "大学英语六级 (CET-6)",
    "普通话二甲",
    "精通粤语"
  ],
  tags: ["Banking", "Sales", "Customer Service", "Risk Management"]
};

export const INITIAL_PROFILES: ResumeProfile[] = [
  {
    id: 'profile-1',
    name: 'Banking Manager Resume',
    targetRole: 'Senior Relationship Manager',
    targetJobDescription: 'Responsible for managing relationships with high-net-worth individuals, promoting wealth management products, and ensuring customer satisfaction in a fast-paced banking environment.',
    updatedAt: Date.now(),
    versions: [
      {
        id: 'v1.0.0',
        label: 'Initial Upload',
        timestamp: Date.now(),
        data: BASE_RESUME,
        note: 'Original imported resume'
      }
    ]
  }
];

export const createNewProfile = (name: string, data: ResumeData = BASE_RESUME, role: string = 'General', jd: string = ''): ResumeProfile => ({
  id: `profile-${Date.now()}`,
  name,
  targetRole: role,
  targetJobDescription: jd,
  updatedAt: Date.now(),
  versions: [{
    id: `v1.0-${Date.now()}`,
    label: 'v1.0 Draft',
    timestamp: Date.now(),
    data: data,
    note: 'Created'
  }]
});
