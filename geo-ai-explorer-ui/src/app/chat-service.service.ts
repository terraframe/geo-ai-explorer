import { Injectable } from '@angular/core';

interface ChatMessage {
  sender: 'user' | 'system';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages: ChatMessage[] = [
    { sender: 'user', text: 'what is the total population impacted if channel reach_25 floods?' },
    { sender: 'system', text: 'I found multiple channel reaches with "25" in their name. Could you please specify which one you are interested in? Here are some examples of the different reaches: - CEMVK_LM_09_LPM_25 - CEMVM_LM_26_HIK_25 - CEMVK_BR_01_FUL_25 - CELRN_TN_ND_PW2_25 Please provide more specific information about which reach_25 you are interested in.' },
    { sender: 'user', text: 'CEMVK_RR_03_ONE_25' },
    { sender: 'system', text: 'The total population that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 431,826 people.' },
    { sender: 'user', text: 'what school zones are impacted?' },
    { sender: 'system', text: '#mappable There are 23 school districts that would be impacted if CEMVK_RR_03_ONE_25 floods, including: - Pine Bluff School District - Hamburg School District - Dermott School District - Dumas School District - Lakeside School District - McGehee School District And several parish school districts in Louisiana such as Avoyelles, Catahoula, Concordia, East Carroll, Franklin, and others.' },
    { sender: 'user', text: 'what is the total number of students impacted' },
    { sender: 'system', text: 'The total number of students that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 66,179 students.' },
  ];

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message);
  }
}