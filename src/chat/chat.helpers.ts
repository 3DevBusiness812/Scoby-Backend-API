export const newMessageSubscriptionFilter = (Id: number, currentRoom: number): boolean => {
    return Id === currentRoom;
  }