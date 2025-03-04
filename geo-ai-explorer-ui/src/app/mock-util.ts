import { ChatMessage } from "./chat-service.service";

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
        { sender: 'user', text: 'what is the total population impacted if channel reach_25 floods?', mappable: false },
        { sender: 'system', text: 'I found multiple channel reaches with "25" in their name. Could you please specify which one you are interested in? Here are some examples of the different reaches: - CEMVK_LM_09_LPM_25 - CEMVM_LM_26_HIK_25 - CEMVK_BR_01_FUL_25 - CELRN_TN_ND_PW2_25 Please provide more specific information about which reach_25 you are interested in.', mappable: false },
        { sender: 'user', text: 'CEMVK_RR_03_ONE_25', mappable: false },
        { sender: 'system', text: 'The total population that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 431,826 people.', mappable: false },
        { sender: 'user', text: 'what school zones are impacted?', mappable: false },
        { sender: 'system', text: 'There are 23 school districts that would be impacted if CEMVK_RR_03_ONE_25 floods, including: - Pine Bluff School District - Hamburg School District - Dermott School District - Dumas School District - Lakeside School District - McGehee School District And several parish school districts in Louisiana such as Avoyelles, Catahoula, Concordia, East Carroll, Franklin, and others.', mappable: true },
        { sender: 'user', text: 'what is the total number of students impacted', mappable: false },
        { sender: 'system', text: 'The total number of students that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 66,179 students.', mappable: false },
      ];
}
