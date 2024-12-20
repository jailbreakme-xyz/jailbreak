/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tournament.json`.
 */
export type Tournament = {
  "address": "9LRtUrui3pfsMpBe7NGLdGsjNUPKRT5W6rwddTTuAxTE",
  "metadata": {
    "name": "tournament",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "concludeTournament",
      "discriminator": [
        12,
        3,
        223,
        101,
        137,
        165,
        187,
        147
      ],
      "accounts": [
        {
          "name": "tournament",
          "writable": true
        },
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "winnerAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "tournament",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  117,
                  114,
                  110,
                  97,
                  109,
                  101,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "startTournament",
      "discriminator": [
        164,
        168,
        208,
        157,
        43,
        10,
        220,
        241
      ],
      "accounts": [
        {
          "name": "tournament",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "systemPromptHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "initialPool",
          "type": "u64"
        },
        {
          "name": "feeMulPctX10",
          "type": "u8"
        },
        {
          "name": "winnerPayoutPct",
          "type": "u8"
        }
      ]
    },
    {
      "name": "submitSolution",
      "discriminator": [
        203,
        233,
        157,
        191,
        70,
        37,
        205,
        0
      ],
      "accounts": [
        {
          "name": "tournament",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "solutionHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tournament",
      "discriminator": [
        175,
        139,
        119,
        242,
        115,
        194,
        57,
        92
      ]
    }
  ],
  "events": [
    {
      "name": "solutionSubmitted",
      "discriminator": [
        206,
        122,
        71,
        176,
        145,
        150,
        230,
        5
      ]
    },
    {
      "name": "tournamentStarted",
      "discriminator": [
        200,
        157,
        174,
        194,
        174,
        219,
        107,
        44
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "tournamentNotRunning",
      "msg": "Tournament is not running"
    },
    {
      "code": 6001,
      "name": "invalidAuthority",
      "msg": "Invalid authority"
    },
    {
      "code": 6002,
      "name": "tournamentNotConcluded",
      "msg": "Tournament is not concluded"
    }
  ],
  "types": [
    {
      "name": "solutionSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "submitter",
            "type": "pubkey"
          },
          {
            "name": "solutionHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amountPaid",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tournament",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "tournamentState"
              }
            }
          },
          {
            "name": "entryFee",
            "type": "u64"
          },
          {
            "name": "feeMulPct",
            "type": "u8"
          },
          {
            "name": "winnerPayoutPct",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tournamentStarted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "systemPromptHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "initialPool",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tournamentState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "concluded"
          },
          {
            "name": "running"
          }
        ]
      }
    }
  ]
};
