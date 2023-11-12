import { TomlDate } from '../../src/date.js';

export const serializableObject: object = {
  title: 'TOML Example',
  owner: {
    name: 'Lance Uppercut',
    dob: TomlDate.ofOffsetDateTime('1979-05-27T07:32:00-08:00')
  },
  database: {
    server: '192.168.1.1',
    ports: [8001, 8002, 8003],
    connection_max: 5000,
    enabled: true
  },
  servers: {
    alpha: {
      ip: '10.0.0.1',
      dc: 'eqdc10'
    },
    beta: {
      ip: '10.0.0.2',
      dc: 'eqdc10'
    }
  },
  clients: {
    data: [
      ['gamma', 'delta'],
      [1, 2]
    ],
    hosts: ['alpha', 'omega']
  },

  memory: {
    redis: {
      server: '127.0.0.1',
      port: 6379,
      pconnect: 1,
      timeout: 0,
      requirepass: 'pa$$w0rd',
      db: 0
    },
    memcache: {
      server: '127.0.0.1',
      port: 11211,
      pconnect: 1,
      timeout: 1
    },
    memcached: {
      server: '127.0.0.1',
      port: 11211
    }
  },

  users: [
    {
      id: 1,
      username: 'admin',
      display_name: 'Admin',
      'first name': 'Eric',
      'last name': 'Clapton'
    },
    {
      id: 2,
      username: 'bob',
      display_name: 'Bob',
      'first name': 'Bob',
      'last name': 'Seger'
    }
  ],

  description: 'Tom\'s Obvious, Minimal Language.\n- TOML is case-sensitive.\n- A TOML file must be a valid UTF-8 encoded Unicode document.\n- Whitespace means tab (0x09) or space (0x20).\n- Newline means LF (0x0A) or CRLF (0x0D 0x0A).',

  pi: 3.14

};
