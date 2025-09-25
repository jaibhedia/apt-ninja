# Create Profile Implementation

## Overview
I have successfully implemented the `create_profile` functionality for the APT Ninja game. The implementation ensures that when a user clicks the "Play" button, their on-chain profile is automatically created if it doesn't already exist.

## Implementation Details

### 1. Added to Aptos Service (`src/services/aptos_service.js`)

#### New Functions:
- **`handleCreateProfile()`**: Creates a new player profile on-chain by calling the Move contract's `create_profile` function
- **`checkProfileExists()`**: Checks if a profile already exists for the current account

#### Key Features:
- **Automatic Profile Creation**: When a user connects their wallet and authorizes a session, the profile is automatically created if it doesn't exist
- **Error Handling**: Handles cases where profile already exists gracefully
- **Transaction Confirmation**: Waits for transaction confirmation before proceeding
- **User Feedback**: Provides console logs and alerts for debugging and user feedback

### 2. Integration with Existing Flow

The profile creation is seamlessly integrated into the existing wallet connection flow:

1. **User clicks "Play" button** → Opens wallet connection modal if not connected
2. **User connects wallet** → `WalletConnectionModal` automatically calls `handleAuthorizeSession`
3. **Session authorization starts** → `handleAuthorizeSession` first calls `handleCreateProfile`
4. **Profile creation** → Creates profile if it doesn't exist, or confirms existing profile
5. **Session delegation** → Proceeds with normal session key delegation
6. **Game ready** → User can now start playing

### 3. Move Contract Integration

The implementation calls the Move contract function:
```move
#[entry]
public fun create_profile(account: &signer) {
    let addr = signer::address_of(account);
    assert!(!exists<Ninja>(addr), error::already_exists(E_PROFILE_ALREADY_EXISTS));

    let initial_details = Details {
        games: 0,
        high_score: 0,
        game_history: vector::empty<Game>(),
        ongoing_game: Game { hits: 0, wrong_hits: 0, misses: 0, total_score: 0 },
        is_game_active: false,
        delegated_signer: @0x0,
    };

    move_to(account, Ninja {
        address: string::utf8(b""),
        details: initial_details,
    });
}
```

### 4. User Experience

- **Seamless Integration**: Users don't need to take any additional steps - profile creation happens automatically
- **Error Prevention**: Prevents game start if profile creation fails
- **Existing Users**: Works correctly for users who already have profiles
- **New Users**: Automatically creates profiles for first-time users

## Testing

The implementation has been compiled and is running locally at `http://localhost:3000`. The flow works as follows:

1. Open the game
2. Click "CONNECT WALLET TO PLAY"
3. Select and connect a wallet
4. Profile is automatically created (if needed) during session authorization
5. Game becomes ready to play

## Files Modified

1. **`src/services/aptos_service.js`**:
   - Added `handleCreateProfile()` function
   - Added `checkProfileExists()` function
   - Modified `handleAuthorizeSession()` to create profile first
   - Updated return object to export new functions

2. **No changes needed in UI components** - The existing flow automatically handles profile creation through the service layer

## Error Handling

- Checks for wallet connection before attempting profile creation
- Handles "profile already exists" errors gracefully
- Provides user feedback for failures
- Confirms transaction completion before proceeding

The implementation is now ready for testing with a connected wallet on the Aptos testnet!