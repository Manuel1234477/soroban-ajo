# Smart Contract Documentation

Complete documentation for the Soroban Ajo smart contract, including function references, events, integration patterns, and security considerations.

## Table of Contents

1. [Contract Overview](#contract-overview)
2. [Function Documentation](#function-documentation)
3. [Event Documentation](#event-documentation)
4. [Data Structures](#data-structures)
5. [Integration Examples](#integration-examples)
6. [Security Considerations](#security-considerations)
7. [Deployment Guide](#deployment-guide)
8. [Error Codes](#error-codes)

---

## Contract Overview

The Soroban Ajo contract is a decentralized rotating savings and credit association (ROSCA) implementation on the Stellar blockchain. It enables groups of users to pool funds and distribute them in rotation.

### Key Features

- **Group Management**: Create and manage savings groups
- **Contribution Tracking**: Track member contributions per cycle
- **Payout Distribution**: Distribute funds to members in rotation
- **Penalty System**: Enforce penalties for late contributions
- **Admin Controls**: Administrative functions for group management

### Contract Address

```
CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4
```

### Network

- **Testnet**: https://soroban-testnet.stellar.org
- **Mainnet**: https://soroban-mainnet.stellar.org

---

## Function Documentation

### Admin Functions

#### `initialize(admin: Address) -> Result<(), AjoError>`

Initializes the contract with an admin address.

**Parameters:**
- `admin` (Address): The administrator address

**Returns:**
- `Ok(())` on success
- `Err(AjoError)` on failure

**Example:**
```rust
let admin = Address::from_contract_id(&env, &contract_id);
initialize(&env, admin)?;
```

**Security Notes:**
- Can only be called once
- Sets the contract administrator
- Initializes the group counter

---

### Group Management Functions

#### `create_group(admin: Address, name: String, contribution_amount: i128, cycle_duration: u64, max_members: u32) -> Result<u32, AjoError>`

Creates a new savings group.

**Parameters:**
- `admin` (Address): Group administrator address
- `name` (String): Group name (max 100 characters)
- `contribution_amount` (i128): Fixed contribution amount in stroops
- `cycle_duration` (u64): Duration of each cycle in seconds
- `max_members` (u32): Maximum number of members (2-1000)

**Returns:**
- `Ok(group_id)` on success
- `Err(AjoError)` on failure

**Example:**
```typescript
const groupId = await contract.create_group({
  admin: userAddress,
  name: "Office Savings Circle",
  contribution_amount: 10000000, // 1 XLM in stroops
  cycle_duration: 2592000, // 30 days
  max_members: 10
});
```

**Validation:**
- Group name must not be empty
- Contribution amount must be positive
- Cycle duration must be at least 1 day
- Max members must be between 2 and 1000

---

#### `add_member(group_id: u32, member: Address) -> Result<(), AjoError>`

Adds a member to a group.

**Parameters:**
- `group_id` (u32): The group ID
- `member` (Address): Member address to add

**Returns:**
- `Ok(())` on success
- `Err(AjoError)` on failure

**Example:**
```typescript
await contract.add_member({
  group_id: 1,
  member: newMemberAddress
});
```

**Validation:**
- Group must exist
- Member must not already be in group
- Group must not be full
- Caller must be group admin

---

#### `remove_member(group_id: u32, member: Address) -> Result<(), AjoError>`

Removes a member from a group.

**Parameters:**
- `group_id` (u32): The group ID
- `member` (Address): Member address to remove

**Returns:**
- `Ok(())` on success
- `Err(AjoError)` on failure

**Example:**
```typescript
await contract.remove_member({
  group_id: 1,
  member: memberAddress
});
```

**Validation:**
- Group must exist
- Member must be in group
- Caller must be group admin
- Member must not have pending payouts

---

### Contribution Functions

#### `contribute(group_id: u32, member: Address, amount: i128) -> Result<(), AjoError>`

Records a contribution from a member.

**Parameters:**
- `group_id` (u32): The group ID
- `member` (Address): Member address
- `amount` (i128): Contribution amount in stroops

**Returns:**
- `Ok(())` on success
- `Err(AjoError)` on failure

**Example:**
```typescript
await contract.contribute({
  group_id: 1,
  member: userAddress,
  amount: 10000000 // 1 XLM
});
```

**Validation:**
- Group must exist
- Member must be in group
- Amount must match group contribution amount
- Member must not have already contributed this cycle
- Cycle must be active

---

#### `get_contribution_status(group_id: u32, cycle: u32, member: Address) -> Result<bool, AjoError>`

Checks if a member has contributed in a cycle.

**Parameters:**
- `group_id` (u32): The group ID
- `cycle` (u32): The cycle number
- `member` (Address): Member address

**Returns:**
- `Ok(true)` if member has contributed
- `Ok(false)` if member has not contributed
- `Err(AjoError)` on failure

**Example:**
```typescript
const hasContributed = await contract.get_contribution_status({
  group_id: 1,
  cycle: 1,
  member: userAddress
});
```

---

### Payout Functions

#### `execute_payout(group_id: u32, cycle: u32, recipient: Address) -> Result<(), AjoError>`

Executes a payout to a recipient.

**Parameters:**
- `group_id` (u32): The group ID
- `cycle` (u32): The cycle number
- `recipient` (Address): Recipient address

**Returns:**
- `Ok(())` on success
- `Err(AjoError)` on failure

**Example:**
```typescript
await contract.execute_payout({
  group_id: 1,
  cycle: 1,
  recipient: recipientAddress
});
```

**Validation:**
- Group must exist
- Recipient must be in group
- Recipient must not have already received payout
- All members must have contributed
- Caller must be group admin

---

#### `get_payout_status(group_id: u32, member: Address) -> Result<bool, AjoError>`

Checks if a member has received their payout.

**Parameters:**
- `group_id` (u32): The group ID
- `member` (Address): Member address

**Returns:**
- `Ok(true)` if member has received payout
- `Ok(false)` if member has not received payout
- `Err(AjoError)` on failure

**Example:**
```typescript
const hasPayout = await contract.get_payout_status({
  group_id: 1,
  member: userAddress
});
```

---

### Query Functions

#### `get_group(group_id: u32) -> Result<Group, AjoError>`

Retrieves group information.

**Parameters:**
- `group_id` (u32): The group ID

**Returns:**
- `Ok(Group)` with group details
- `Err(AjoError)` if group not found

**Example:**
```typescript
const group = await contract.get_group({ group_id: 1 });
console.log(group.name); // "Office Savings Circle"
console.log(group.member_count); // 10
```

---

#### `get_group_members(group_id: u32) -> Result<Vec<Address>, AjoError>`

Retrieves all members of a group.

**Parameters:**
- `group_id` (u32): The group ID

**Returns:**
- `Ok(Vec<Address>)` with member addresses
- `Err(AjoError)` if group not found

**Example:**
```typescript
const members = await contract.get_group_members({ group_id: 1 });
console.log(members.length); // 10
```

---

#### `get_current_cycle(group_id: u32) -> Result<u32, AjoError>`

Gets the current cycle number for a group.

**Parameters:**
- `group_id` (u32): The group ID

**Returns:**
- `Ok(cycle_number)` current cycle
- `Err(AjoError)` if group not found

**Example:**
```typescript
const cycle = await contract.get_current_cycle({ group_id: 1 });
console.log(cycle); // 5
```

---

## Event Documentation

### GroupCreated Event

Emitted when a new group is created.

**Event Data:**
```rust
pub struct GroupCreatedEvent {
    pub group_id: u32,
    pub admin: Address,
    pub name: String,
    pub contribution_amount: i128,
    pub max_members: u32,
}
```

**Example:**
```typescript
contract.on('GroupCreated', (event) => {
  console.log(`Group ${event.group_id} created by ${event.admin}`);
});
```

---

### MemberAdded Event

Emitted when a member is added to a group.

**Event Data:**
```rust
pub struct MemberAddedEvent {
    pub group_id: u32,
    pub member: Address,
    pub timestamp: u64,
}
```

**Example:**
```typescript
contract.on('MemberAdded', (event) => {
  console.log(`Member ${event.member} added to group ${event.group_id}`);
});
```

---

### ContributionRecorded Event

Emitted when a contribution is recorded.

**Event Data:**
```rust
pub struct ContributionRecordedEvent {
    pub group_id: u32,
    pub member: Address,
    pub cycle: u32,
    pub amount: i128,
    pub timestamp: u64,
}
```

**Example:**
```typescript
contract.on('ContributionRecorded', (event) => {
  console.log(`Contribution of ${event.amount} recorded for cycle ${event.cycle}`);
});
```

---

### PayoutExecuted Event

Emitted when a payout is executed.

**Event Data:**
```rust
pub struct PayoutExecutedEvent {
    pub group_id: u32,
    pub recipient: Address,
    pub cycle: u32,
    pub amount: i128,
    pub timestamp: u64,
}
```

**Example:**
```typescript
contract.on('PayoutExecuted', (event) => {
  console.log(`Payout of ${event.amount} executed to ${event.recipient}`);
});
```

---

## Data Structures

### Group

```rust
pub struct Group {
    pub id: u32,
    pub admin: Address,
    pub name: String,
    pub contribution_amount: i128,
    pub cycle_duration: u64,
    pub max_members: u32,
    pub member_count: u32,
    pub current_cycle: u32,
    pub created_at: u64,
    pub status: GroupStatus,
}
```

### GroupStatus

```rust
pub enum GroupStatus {
    Active,
    Paused,
    Closed,
}
```

### Member

```rust
pub struct Member {
    pub address: Address,
    pub joined_at: u64,
    pub contributions: u32,
    pub payouts_received: u32,
    pub status: MemberStatus,
}
```

### MemberStatus

```rust
pub enum MemberStatus {
    Active,
    Inactive,
    Suspended,
}
```

---

## Integration Examples

### JavaScript/TypeScript Integration

```typescript
import { Contract } from '@stellar/js-sdk';

// Initialize contract
const contract = new Contract(contractId, networkPassphrase);

// Create a group
const groupId = await contract.create_group({
  admin: userAddress,
  name: "Community Savings",
  contribution_amount: 10000000,
  cycle_duration: 2592000,
  max_members: 20
});

// Add members
await contract.add_member({
  group_id: groupId,
  member: memberAddress
});

// Record contribution
await contract.contribute({
  group_id: groupId,
  member: userAddress,
  amount: 10000000
});

// Execute payout
await contract.execute_payout({
  group_id: groupId,
  cycle: 1,
  recipient: recipientAddress
});
```

### Backend Integration

```typescript
import { SorobanService } from './services/soroban';

class GroupService {
  constructor(private soroban: SorobanService) {}

  async createGroup(data: CreateGroupDTO) {
    const groupId = await this.soroban.createGroup(data);
    return groupId;
  }

  async addMember(groupId: number, memberAddress: string) {
    await this.soroban.addMember(groupId, memberAddress);
  }

  async recordContribution(groupId: number, memberAddress: string, amount: number) {
    await this.soroban.contribute(groupId, memberAddress, amount);
  }
}
```

---

## Security Considerations

### 1. Access Control

- Only group admins can manage members
- Only members can contribute
- Payouts require admin authorization

**Implementation:**
```rust
if env.invoker() != group.admin {
    return Err(AjoError::Unauthorized);
}
```

### 2. Amount Validation

- Contributions must match exact group amount
- Prevent over/under contributions

**Implementation:**
```rust
if amount != group.contribution_amount {
    return Err(AjoError::InvalidAmount);
}
```

### 3. Cycle Management

- Prevent duplicate contributions per cycle
- Enforce cycle progression

**Implementation:**
```rust
let key = (group_id, current_cycle, member);
if env.storage().has(&key) {
    return Err(AjoError::AlreadyContributed);
}
```

### 4. Reentrancy Protection

- Use checks-effects-interactions pattern
- Validate state before external calls

### 5. Overflow Protection

- Use checked arithmetic
- Validate amounts before operations

---

## Deployment Guide

### Prerequisites

```bash
# Install Soroban CLI
cargo install --locked soroban-cli

# Install Rust
rustup update
```

### Build Contract

```bash
cd contracts/ajo
stellar contract build
```

### Deploy to Testnet

```bash
# Set network
stellar network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Create deployer account
stellar keys generate deployer

# Fund account (visit https://friendbot.stellar.org)

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/ajo.wasm \
  --network testnet \
  --source deployer
```

### Deploy to Mainnet

```bash
stellar network add --global mainnet \
  --rpc-url https://soroban-mainnet.stellar.org \
  --network-passphrase "Public Global Stellar Network ; September 2015"

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/ajo.wasm \
  --network mainnet \
  --source deployer
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1 | `Unauthorized` | Caller not authorized for operation |
| 2 | `GroupNotFound` | Group does not exist |
| 3 | `MemberNotFound` | Member not in group |
| 4 | `InvalidAmount` | Contribution amount incorrect |
| 5 | `AlreadyContributed` | Member already contributed this cycle |
| 6 | `GroupFull` | Group has reached max members |
| 7 | `InvalidCycleDuration` | Cycle duration too short |
| 8 | `InvalidMaxMembers` | Max members out of range |
| 9 | `PayoutAlreadyReceived` | Member already received payout |
| 10 | `InsufficientFunds` | Insufficient funds for payout |

---

## Testing

### Unit Tests

```bash
cd contracts/ajo
cargo test
```

### Integration Tests

```bash
cargo test --test integration_tests
```

### Test Coverage

```bash
cargo tarpaulin --out Html
```

---

## Support

For questions or issues:
1. Check the [Smart Contract Integration Guide](./SMART_CONTRACT_INTEGRATION.md)
2. Review [API Reference](../backend/docs/API_REFERENCE.md)
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: April 2026
**Version**: 1.0.0
**Maintainers**: Ajo Development Team
