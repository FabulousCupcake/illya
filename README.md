# TODO / Notes

- [ ] info command that prints your roles (owner, admin, pilot)

- [ ] on-demand audit command (or just well integrated everywhere)
  - This means neatly adding facts when printing certain reports
  - e.g.: This is the list of users for today that has access to stuff
    - [L] indicates verified Lead/Admin (hardcoded list)
    - [M] indicates verified Member (role-based)
    - [F] indicates verified Friend (role-based)
    - [!] when someone is none of these

## Commands
- ✅ `/illya access add <user>`
- ✅ `/illya access remove <user>`
- ✅ `/illya access list`
  Prints everyone that has access, and why (lead? pilot?)

- ✅ `/illya setpassword <string>`
  Sets link password for said user

- ✅ `/illya setaccountid <string>`
  Sets the 9-digit ingame account id for said user

- ✅ `/illya login [account: <user>]`
  ✅ Notifies bot that <sender> is logging into <user>; self if omitted
  ✅ Records the timestamp
  ✅ Refuses if someone is already logged into said account.
  ✅ Displays the link password in spoiler, autodeletes (via edit) in 60s
  ✅ Displays the account id for ease of copypaste

- ✅ `/illya logout [account: <user>]`
  Notifies bot that <sender> logs out from <user>; self if omitted

- ✅`/illya status`
  Prints the list of who is on whom
  Display the duration of login (relative timestamp)

- ✅ `/illya super login <user> [account: <user>]`
- ✅ `/illya super logout <user> [account: <user>]`
- ✅ `/illya super setpassword <user> <string>`
- ✅ `/illya super setaccountid <user> <string>`
  Do action on behalf of someone, intended for leads to use on unresponsive persons

## Command aliases
- ✅ `/ii` for `/illya status`
- ✅ `/il` for `/illya login`
- ✅ `/io` for `/illya logout`