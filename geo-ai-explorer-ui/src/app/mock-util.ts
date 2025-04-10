import { ChatMessage, LocationPage } from "./models/chat.model";
import { Configuration } from "./models/configuration.model";
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

  public static message: ChatMessage =
    {
      id: '1',
      sender: 'user',
      text: "The following school districts would be impacted if LEV_A_96 floods:\n\n<location><label>Concordia Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2200480</uri></location>\n<location><label>Richland Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2201350</uri></location>\n<location><label>East Carroll Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2200570</uri></location>\n<location><label>West Carroll Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2201950</uri></location>\n<location><label>Monroe City School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2201080</uri></location>\n<location><label>McGehee School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-0509630</uri></location>\n<location><label>Ouachita Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2201200</uri></location>\n<location><label>Dumas School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-0505500</uri></location>\n<location><label>Avoyelles Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2200150</uri></location>\n<location><label>Tensas Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2201710</uri></location>\n<location><label>Franklin Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2200660</uri></location>\n<location><label>Madison Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2201050</uri></location>\n<location><label>Catahoula Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2200420</uri></location>\n<location><label>Dermott School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-0505170</uri></location>\n<location><label>Hamburg School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-0500042</uri></location>\n<location><label>Lakeside School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-0508640</uri></location>\n<location><label>Pine Bluff School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-0500026</uri></location>\n<location><label>Morehouse Parish School District</label><uri>https://localhost:4200/lpg/graph_801104/0#SchoolZone-2201110</uri></location>\n\n",
      mappable: false,
      purpose: 'standard'
    }

  public static messages: ChatMessage[] = [
    { id: '1', sender: 'user', text: 'what is the total population impacted if channel reach_25 floods?', mappable: false, purpose: 'standard', },
    { id: '2', sender: 'system', text: "I found multiple channel reaches that match your search. Please specify which one you're interested in:\n<location><label>CELRN_CL_ND_MEL_25</label><uri>https://localhost:4200/lpg/graph_801104/0#ChannelReach-CELRN_CL_ND_MEL_25</uri></location>\n<location><label>CELRN_CR_ND_BL1_25</label><uri>https://localhost:4200/lpg/graph_801104/0#ChannelReach-CELRN_CR_ND_BL1_25</uri></location>\n<location><label>CELRN_CR_ND_CH1_25</label><uri>https://localhost:4200/lpg/graph_801104/0#ChannelReach-CELRN_CR_ND_CH1_25</uri></location>\n<location><label>CELRN_CR_ND_COR_25</label><uri>https://localhost:4200/lpg/graph_801104/0#ChannelReach-CELRN_CR_ND_COR_25</uri></location>\n<location><label>CELRN_CR_ND_OLD_25</label><uri>https://localhost:4200/lpg/graph_801104/0#ChannelReach-CELRN_CR_ND_OLD_25</uri></location>\n(and many more...)\n\nPlease provide the specific channel reach code you'd like to analyze.", mappable: false,  ambiguous: true, purpose: 'standard', location: 'reach_25' },
    { id: '3', sender: 'user', text: 'CEMVK_RR_03_ONE_25', mappable: false, purpose: 'standard' },
    { id: '4', sender: 'system', text: 'The total population that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 431,826 people.', mappable: true, purpose: 'standard' },
    { id: '5', sender: 'user', text: 'what school zones are impacted?', mappable: false, purpose: 'standard' },
    { id: '6', sender: 'system', text: 'The following school districts would be impacted if CEMVK_RR_03_ONE_25 floods:\n- Iberia Parish School District\n- St. Martin Parish School District\n- Rapides Parish School District\n- St. Landry Parish School District\n- Avoyelles Parish School District\n- St. Mary Parish School District\n- Catahoula Parish School District\n- Richland Parish School District\n- East Carroll Parish School District\n- West Carroll Parish School District\n- Concordia Parish School District\n- Monroe City School District\n- McGehee School District\n- Ouachita Parish School District\n- Dumas School District\n- Tensas Parish School District\n- Franklin Parish School District\n- Madison Parish School District\n- Dermott School District\n- Hamburg School District\n- Lakeside School District\n- Pine Bluff School District\n- Morehouse Parish School District\n', mappable: true, purpose: 'standard' },
    { id: '7', sender: 'user', text: 'what is the total number of students impacted', mappable: false, purpose: 'standard' },
    { id: '8', sender: 'system', text: 'The total number of students that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 66,179 students.', mappable: true, purpose: 'standard' },
    { id: '9', sender: 'user', text: 'Show me all objects which are reachable from a program with code 000510', mappable: false, purpose: 'standard' },
    { id: '10', sender: 'system', text: 'The program with code \"000510\" is connected to multiple objects including:\n\nChannel Areas:\n<location><label>CHARLES D MAYNARD</label><uri>CESWL_AR_05_MAY</uri></location>\n<location><label>OZARK-JETTA TAYLOR</label><uri>CESWL_AR_12_OZA</uri></location>\n<location><label>MURRAY</label><uri>CESWL_AR_07_MUR</uri></location>\n<location><label>WILBUR D MILLS</label><uri>CESWL_AR_02_MIL</uri></location>\n\nProjects:\n<location><label>OZARK-JETA TAYLOR LOCK & DAM</label><uri>30000570</uri></location>\n<location><label>LOCK & DAM 5</label><uri>30000573</uri></location>\n<location><label>MONTGOMERY POINT LOCK & DAM</label><uri>30000628</uri></location>\n\nRecreation Areas:\n<location><label>DAM SITE 6 WEST</label><uri>RAR_ID_1636</uri></location>\n<location><label>BURNS PARK</label><uri>RAR_ID_1634</uri></location>\n<location><label>WILLOW BEACH</label><uri>RAR_ID_1651</uri></location>\n\nAnd multiple channel reaches and levee areas.\n', mappable: true, purpose: 'standard' },
  ];

  public static explorerInit: ExplorerInit = {

  }

  public static locations: LocationPage = {
    statement: "A list of available locations",
    locations: [
      {
        "properties": {
          "code": "220072002479",
          "label": "BELLE PLACE ELEMENTARY SCHOOL",
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220072002479",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220072002479",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220159001222",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220159001222",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-228010002497",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-228010002497",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220072000519",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220072000519",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220129001054",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220129001054",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220156001209",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220156001209",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220156001989",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220156001989",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220129001053",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220129001053",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220129001072",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220129001072",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220159001220",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220159001220",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-228010001627",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-228010001627",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220159001219",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220159001219",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220015000073",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220015000073",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220129001038",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220129001038",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220159001218",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220159001218",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220129001080",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220129001080",
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
          "type": "https://localhost:4200/lpg/graph_801104/0/rdfs#School",
          "uri": "https://localhost:4200/lpg/graph_801104/0#School-220004702462",
          edges: {}
        },
        "type": "Feature",
        "id": "https://localhost:4200/lpg/graph_801104/0#School-220004702462",
        "geometry": {
          "coordinates": [
            [
              -92.1665,
              30.9368
            ]
          ],
          "type": "MultiPoint"
        }
      }
    ],
    limit: 17,
    offset: 0,
    count: 17
  };

  public static styles: Configuration = {
    layers: [],
    token: "",
    styles: {
      "https://localhost:4200/lpg/graph_801104/0#RealProperty": {
        "color": "#79F294",
        "order": 0
      },
      "https://localhost:4200/lpg/graph_801104/0#ChannelReach": {
        "color": "#79DAF2",
        "order": 4
      },
      "https://localhost:4200/lpg/graph_801104/0#Reservoir": {
        "color": "#CAEEFB",
        "order": 5
      },
      "https://localhost:4200/lpg/graph_801104/0#RecreationArea": {
        "color": "#F2E779",
        "order": 3
      },
      "https://localhost:4200/lpg/graph_801104/0#LeveedArea": {
        "color": "#C379F2",
        "order": 4
      },
      "https://localhost:4200/lpg/graph_801104/0#SchoolZone": {
        "color": "#FBE3D6",
        "order": 6
      },
      "https://localhost:4200/lpg/graph_801104/0#Project": {
        "color": "#C0F279",
        "order": 6
      },
      "https://localhost:4200/lpg/graph_801104/0#LeveeArea": {
        "color": "#D1D1D1",
        "order": 4
      },
      "https://localhost:4200/lpg/graph_801104/0#School": {
        "color": "#F2A579",
        "order": 0
      },
      "https://localhost:4200/lpg/graph_801104/0#Levee": {
        "color": "#F279E0",
        "order": 0
      },
      "https://localhost:4200/lpg/graph_801104/0#Hospital": {
        "color": "#F2799D",
        "order": 0
      },
      "https://localhost:4200/lpg/graph_801104/0#Dam": {
        "color": "#D5F279",
        "order": 0
      },
      "https://localhost:4200/lpg/graph_801104/0#River": {
        "color": "#7999F2",
        "order": 2
      },
      "https://localhost:4200/lpg/graph_801104/0#Watershed": {
        "color": "#79F2C9",
        "order": 4
      },
      "https://localhost:4200/lpg/graph_801104/0#ChannelArea": {
        "color": "#156082",
        "order": 4
      },
      "https://localhost:4200/lpg/graph_801104/0#ChannelLine": {
        "color": "#79F2A0",
        "order": 1
      },
      "https://localhost:4200/lpg/graph_801104/0#UsaceRecreationArea": {
        "color": "#F2BE79",
        "order": 3
      },
      "http://dime.usace.mil/ontologies/cwbi-concept#Program": {
        "color": "#FF5733",
        "order": 0
      },
      "https://localhost:4200/lpg/graph_801104/0#WaterLock": {
        "color": "#79F2E2",
        "order": 0
      }
    }
  }




}
