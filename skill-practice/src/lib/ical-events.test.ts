import test from "node:test";
import assert from "node:assert/strict";
import { parseFederationCalendar } from "./ical-events.ts";

const zone = `BEGIN:VTIMEZONE
TZID:Europe/Rome
BEGIN:DAYLIGHT
DTSTART:19700329T020000
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
DTSTART:19701025T030000
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;
const calendar = (events: string, timezone = zone) => `BEGIN:VCALENDAR\nVERSION:2.0\n${timezone}\n${events}\nEND:VCALENDAR`.replaceAll("\n", "\r\n");
const entry = (body: string) => `BEGIN:VEVENT\n${body}\nEND:VEVENT`;
const parse = (events: string, timeZone = "Europe/Rome") => parseFederationCalendar(calendar(events), { from: "2026-01-01", to: "2027-12-31", timeZone });

test("ICS converts winter/summer times, all-day exclusive end and folded/escaped text", () => {
  const events = parse([
    entry("UID:winter\nDTSTART;TZID=Europe/Rome:20261121T093000\nDTEND;TZID=Europe/Rome:20261121T123000\nSUMMARY:Allenamento\n Cinture Nere\nLOCATION:Palestra\\, Milano"),
    entry("UID:summer\nDTSTART;TZID=Europe/Rome:20260606T093000\nDTEND;TZID=Europe/Rome:20260606T123000\nSUMMARY:Estate"),
    entry("UID:stage\nDTSTART;VALUE=DATE:20260612\nDTEND;VALUE=DATE:20260615\nSUMMARY:Stage\nDESCRIPTION:<b>Prima</b> &amp; seconda\\nRiga"),
  ].join("\n"));
  const winter = events.find((event) => event.source_uid === "winter")!;
  assert.equal(winter.starts_at, "2026-11-21T08:30:00.000Z");
  assert.equal(winter.title, "AllenamentoCinture Nere");
  assert.equal(winter.location, "Palestra, Milano");
  assert.equal(events.find((event) => event.source_uid === "summer")!.starts_at, "2026-06-06T07:30:00.000Z");
  const stage = events.find((event) => event.source_uid === "stage")!;
  assert.equal(stage.starts_at, "2026-06-11T22:00:00.000Z");
  assert.equal(stage.ends_on, "2026-06-14");
  assert.equal(stage.all_day, true);
  assert.equal(stage.description, "Prima & seconda\nRiga");
});

test("ICS expands recurrence, exclusions and moved exceptions with stable occurrence identity", () => {
  const events = parse([
    entry("UID:series\nDTSTART:20261107T083000Z\nDTEND:20261107T113000Z\nRRULE:FREQ=WEEKLY;COUNT=3\nEXDATE:20261114T083000Z\nSUMMARY:Serie"),
    entry("UID:series\nRECURRENCE-ID:20261121T083000Z\nDTSTART:20261122T090000Z\nDTEND:20261122T120000Z\nSUMMARY:Spostato"),
  ].join("\n"));
  assert.equal(events.length, 2);
  assert.equal(events[1].starts_on, "2026-11-22");
  assert.equal(events[1].recurrence_key, "2026-11-21T08:30:00Z");
  assert.equal(events[1].title, "Spostato");
});

test("ICS keeps the latest sequence, cancellations and events overlapping the import boundary", () => {
  const events = parse([
    entry("UID:duplicate\nSEQUENCE:1\nDTSTAMP:20261101T000000Z\nDTSTART:20261121T083000Z\nSUMMARY:Vecchio"),
    entry("UID:duplicate\nSEQUENCE:2\nDTSTAMP:20261001T000000Z\nDTSTART:20261121T083000Z\nSUMMARY:Nuovo\nSTATUS:CANCELLED"),
    entry("UID:overlap\nDTSTART;VALUE=DATE:20251231\nDTEND;VALUE=DATE:20260103\nSUMMARY:Capodanno"),
  ].join("\n"));
  assert.equal(events.length, 2);
  assert.equal(events.find((event) => event.source_uid === "duplicate")!.cancelled, true);
  assert.equal(events.find((event) => event.source_uid === "duplicate")!.title, "Nuovo");
  assert.equal(events[0].ends_on, "2026-01-02");
});

test("ICS rejects invalid/empty feeds, unresolved timezones and excessive expansion", () => {
  const options = { from: "2026-01-01", to: "2027-12-31", timeZone: "UTC" };
  assert.throws(() => parseFederationCalendar("<html>error</html>", options));
  assert.throws(() => parseFederationCalendar(calendar(""), options));
  assert.throws(() => parse(entry("UID:zone\nDTSTART;TZID=Missing/Zone:20261121T093000\nSUMMARY:Errore")));
  assert.throws(() => parse(entry("UID:large\nDTSTART:20260101T000000Z\nRRULE:FREQ=SECONDLY\nSUMMARY:Troppi")));
});
