on run argv
  set doDelete to (item 1 of argv) is "delete"
  tell application "Mail"
    set out to ""
    set pats to {"Blackcomb", "Plaintxt", "Keyrate", "Co-Stanza", "Sighting", "Cyllene", "Payment Failed"}
    repeat with a in accounts
      if enabled of a then
        repeat with mb in mailboxes of a
          if name of mb is in {"INBOX", "All Mail"} then
            set ms to (messages of mb whose date received > ((current date) - 4 * days))
            repeat with m in ms
              set s to subject of m
              set hit to false
              repeat with p in pats
                if s contains (p as string) then set hit to true
              end repeat
              if hit and s does not contain "uploaded build for Sighting" then
                set out to out & (name of a) & " | " & (date received of m as string) & " | " & (sender of m) & " | " & s & linefeed
                if doDelete then delete m
              end if
            end repeat
          end if
        end repeat
      end if
    end repeat
    return out
  end tell
end run
