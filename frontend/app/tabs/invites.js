import SwipedPage from '../swiped';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const InviteTab = createBottomTabNavigator();

const sentInvites = () => (
  <SwipedPage/>
);

const recievedInvites = () => (
  <SwipedPage/>
);

export default function InviteNavigator() {
  return (
    <InviteTab.Navigator>
      <InviteTab.Screen name="Sent Invites" children={sentInvites} />
      <InviteTab.Screen name="Recieved Invites" children={recievedInvites} />
    </InviteTab.Navigator>
  )
}