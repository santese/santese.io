---
title: Why I chose TP-Link Deco over UniFi for my home Wi-Fi
description: I kept my UniFi Dream Machine Pro and swapped the access points for a three-pack of TP-Link Deco BE23 units, because UniFi Wi-Fi 7 cost more than my home network needed.
publishedAt: 2026-11-27
tags: [homelab, networking, wifi]
---

I've run UniFi at home for a while: a Dream Machine Pro at the center of the network and a couple of older UniFi AC Pro access points. When it was time to upgrade the wireless, staying with UniFi was the obvious move.

I bought a three-pack of TP-Link Deco BE23 units instead. They're dual-band Wi-Fi 7 access points.

## Why I didn't stick with UniFi

Mostly cost. My home is spread over several levels and already has Cat5e running through it, and covering it with UniFi Wi-Fi 7 access points would have cost considerably more.

I like UniFi, but I started to doubt the extra money bought me anything I'd use at home. I wanted good coverage and fast, reliable Wi-Fi throughout the house, and that doesn't take enterprise wireless gear.

## Why the Deco BE23

The BE23 covered what I needed:

- Wi-Fi 7 on 2.4 GHz and 5 GHz
- Two 2.5 GbE ports per unit
- Ethernet backhaul, so with Cat5e already in the walls the units don't depend on a wireless link to each other
- Access point mode
- No extra PoE equipment
- A reasonable price for three units

It has no 6 GHz band. At this price, and for the speeds I was after, I could live without it.

## Keeping the Dream Machine Pro

The Dream Machine Pro still handles routing, firewall rules, DHCP, and the rest of the core network, with the Deco units running in access point mode behind it.

What I gave up is unified wireless management. I don't get the visibility or the fine-grained wireless settings I'd have with UniFi access points. For a home network, I'm fine with that.

## How it performs

I'm getting around 1 Gbps download over Wi-Fi. Faster and more capable access points exist, but this is the speed I wanted, so it's hard to justify spending much more on wireless. I'd rather put that money into parts of the homelab where I'd notice the difference.

## Final thoughts

Working in IT, it's tempting to put enterprise gear in every part of the home network. I like having that level of control, but sometimes the cheaper, simpler option is enough.

I still like UniFi and have no plans to replace the Dream Machine Pro. For the wireless upgrade, the Deco made more financial sense, and I don't mind running two vendors to get it.
