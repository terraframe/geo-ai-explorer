import { ChatMessage } from "./models/chat.model";
import { GeoObject } from "./models/geoobject.model";
import { Style } from "./models/style.model";
import { ExplorerInit } from "./service/explorer.service";

export class MockUtil {
  private static loremSentences: string[] = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Curabitur pretium tincidunt lacus, nec faucibus lectus suscipit id.",
    "Praesent suscipit ipsum et ligula consectetur, at tristique quam facilisis.",
    "Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.",
    "Cras ultricies ligula sed magna dictum porta.",
    "Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a."
  ];

  public static getRandomLoremIpsum(): string {
    const randomIndex = Math.floor(Math.random() * this.loremSentences.length);
    return this.loremSentences[randomIndex];
  }

  public static messages: ChatMessage[] = [
    { id: '1', sender: 'user', text: 'what is the total population impacted if channel reach_25 floods?', mappable: false },
    { id: '2', sender: 'system', text: 'I found multiple channel reaches with "25" in their name. Could you please specify which one you are interested in? Here are some examples of the different reaches: - CEMVK_LM_09_LPM_25 - CEMVM_LM_26_HIK_25 - CEMVK_BR_01_FUL_25 - CELRN_TN_ND_PW2_25 Please provide more specific information about which reach_25 you are interested in.', mappable: false },
    { id: '3', sender: 'user', text: 'CEMVK_RR_03_ONE_25', mappable: false },
    { id: '4', sender: 'system', text: 'The total population that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 431,826 people.', mappable: true },
    { id: '5', sender: 'user', text: 'what school zones are impacted?', mappable: false },
    { id: '6', sender: 'system', text: 'There are 23 school districts that would be impacted if CEMVK_RR_03_ONE_25 floods, including: - Pine Bluff School District - Hamburg School District - Dermott School District - Dumas School District - Lakeside School District - McGehee School District And several parish school districts in Louisiana such as Avoyelles, Catahoula, Concordia, East Carroll, Franklin, and others.', mappable: true },
    { id: '7', sender: 'user', text: 'what is the total number of students impacted', mappable: false },
    { id: '8', sender: 'system', text: 'The total number of students that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 66,179 students.', mappable: true },
  ];

  public static explorerInit: ExplorerInit = {
    
  }

  public static locations: any[] = [
    {
      "properties": {
        "code": "220072002479",
        "label": "BELLE PLACE ELEMENTARY SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220072002479",
      "geometry": {
        "coordinates": [
          [
            -91.7549,
            30.007
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220159001222",
        "label": "CECILIA PRIMARY SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220159001222",
      "geometry": {
        "coordinates": [
          [
            -91.852,
            30.3396
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "228010002497",
        "label": "CENTRAL LOUISIANA SUPPORTS AND SERVICES CENTER",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-228010002497",
      "geometry": {
        "coordinates": [
          [
            -92.4971,
            31.2965
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220072000519",
        "label": "JEANERETTE SENIOR HIGH SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220072000519",
      "geometry": {
        "coordinates": [
          [
            -91.7026,
            29.9453
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220129001054",
        "label": "D.F. HUDDLE ELEMENTARY",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220129001054",
      "geometry": {
        "coordinates": [
          [
            -92.4754,
            31.2976
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220156001209",
        "label": "PORT BARRE ELEMENTARY SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220156001209",
      "geometry": {
        "coordinates": [
          [
            -91.9504,
            30.569
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220156001989",
        "label": "NORTH CENTRAL HIGH SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220156001989",
      "geometry": {
        "coordinates": [
          [
            -91.9845,
            30.7278
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220129001053",
        "label": "HORSESHOE DRIVE ELEMENTARY NEW VISION ACADEMY",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220129001053",
      "geometry": {
        "coordinates": [
          [
            -92.4616,
            31.2614
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220129001072",
        "label": "POLAND JUNIOR HIGH SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220129001072",
      "geometry": {
        "coordinates": [
          [
            -92.2757,
            31.1673
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220159001220",
        "label": "CATAHOULA ELEMENTARY SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220159001220",
      "geometry": {
        "coordinates": [
          [
            -91.7098,
            30.2173
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "228010001627",
        "label": "RAYMOND LABORDE CORRECTIONAL CENTER",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-228010001627",
      "geometry": {
        "coordinates": [
          [
            -92.0257,
            30.9728
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220159001219",
        "label": "BREAUX BRIDGE HIGH SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220159001219",
      "geometry": {
        "coordinates": [
          [
            -91.8578,
            30.255
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220015000073",
        "label": "MARKSVILLE HIGH SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220015000073",
      "geometry": {
        "coordinates": [
          [
            -92.0716,
            31.1271
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220129001038",
        "label": "ACADIAN ELEMENTARY",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220129001038",
      "geometry": {
        "coordinates": [
          [
            -92.4119,
            31.2872
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220159001218",
        "label": "BREAUX BRIDGE PRIMARY SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220159001218",
      "geometry": {
        "coordinates": [
          [
            -91.8912,
            30.2786
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220129001080",
        "label": "W.O. HALL 6TH GRADE ACADEMY",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220129001080",
      "geometry": {
        "coordinates": [
          [
            -92.432,
            31.2918
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220004702462",
        "label": "CENTRAL SOUTHWEST ALTERNATIVE HIGH SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220004702462",
      "geometry": {
        "coordinates": [
          [
            -92.1665,
            30.9368
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "590014600046",
        "label": "CHITIMACHA TRIBAL SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-590014600046",
      "geometry": {
        "coordinates": [
          [
            -91.5316,
            29.885
          ]
        ],
        "type": "MultiPoint"
      }
    },
    {
      "properties": {
        "code": "220015000072",
        "label": "MARKSVILLE ELEMENTARY SCHOOL",
        "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School"
      },
      "type": "Feature",
      "id": "https://localhost:4200/lpg/graph_801104/0/rdfs#School-220015000072",
      "geometry": {
        "coordinates": [
          [
            -92.0731,
            31.1277
          ]
        ],
        "type": "MultiPoint"
      }
    }
  ];

  public static styles: { [key: string]: Style } = {
    "https://localhost:4200/lpg/graph_801104/0/rdfs#RealProperty": {
      "color": "#79F294",
      "order": 0
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#ChannelReach": {
      "color": "#79DAF2",
      "order": 4
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#Reservoir": {
      "color": "#CAEEFB",
      "order": 5
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#RecreationArea": {
      "color": "#F2E779",
      "order": 3
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#LeveedArea": {
      "color": "#C379F2",
      "order": 4
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#SchoolZone": {
      "color": "#FBE3D6",
      "order": 6
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#Project": {
      "color": "#C0F279",
      "order": 6
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#LeveeArea": {
      "color": "#D1D1D1",
      "order": 4
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#School": {
      "color": "#F2A579",
      "order": 0
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#Levee": {
      "color": "#F279E0",
      "order": 0
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#Hospital": {
      "color": "#F2799D",
      "order": 0
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#Dam": {
      "color": "#D5F279",
      "order": 0
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#River": {
      "color": "#7999F2",
      "order": 2
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#Watershed": {
      "color": "#79F2C9",
      "order": 4
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#ChannelArea": {
      "color": "#156082",
      "order": 4
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#ChannelLine": {
      "color": "#79F2A0",
      "order": 1
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#UsaceRecreationArea": {
      "color": "#F2BE79",
      "order": 3
    },
    "http://dime.usace.mil/ontologies/cwbi-concept#Program": {
      "color": "#FF5733",
      "order": 0
    },
    "https://localhost:4200/lpg/graph_801104/0/rdfs#WaterLock": {
      "color": "#79F2E2",
      "order": 0
    }
  }




}
