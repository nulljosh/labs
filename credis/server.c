// credis: minimal Redis-protocol (RESP) server in C.
// Supports PING, SET, GET, DEL over TCP using a naive in-memory hash table.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#define PORT 6390
#define MAX_CLIENTS 16
#define BUF_SIZE 4096
#define TABLE_SIZE 1024

typedef struct Entry {
    char *key;
    char *val;
    struct Entry *next;
} Entry;

static Entry *table[TABLE_SIZE];

static unsigned long hash(const char *s) {
    unsigned long h = 5381;
    while (*s) h = ((h << 5) + h) + (unsigned char)(*s++);
    return h % TABLE_SIZE;
}

static void kv_set(const char *key, const char *val) {
    unsigned long i = hash(key);
    for (Entry *e = table[i]; e; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            free(e->val);
            e->val = strdup(val);
            return;
        }
    }
    Entry *e = malloc(sizeof(Entry));
    e->key = strdup(key);
    e->val = strdup(val);
    e->next = table[i];
    table[i] = e;
}

static const char *kv_get(const char *key) {
    unsigned long i = hash(key);
    for (Entry *e = table[i]; e; e = e->next)
        if (strcmp(e->key, key) == 0) return e->val;
    return NULL;
}

static int kv_del(const char *key) {
    unsigned long i = hash(key);
    Entry **pp = &table[i];
    while (*pp) {
        if (strcmp((*pp)->key, key) == 0) {
            Entry *dead = *pp;
            *pp = dead->next;
            free(dead->key);
            free(dead->val);
            free(dead);
            return 1;
        }
        pp = &(*pp)->next;
    }
    return 0;
}

// Parses a RESP array-of-bulk-strings command, e.g.
// *3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n
// into argv/argc. Returns bytes consumed, or -1 if incomplete/invalid.
static int parse_command(const char *buf, int len, char *argv[], int *argc) {
    if (len < 4 || buf[0] != '*') return -1;
    const char *p = buf;
    int nargs = atoi(p + 1);
    p = memchr(p, '\n', len - (p - buf));
    if (!p) return -1;
    p++;
    *argc = 0;
    for (int i = 0; i < nargs; i++) {
        if (*p != '$') return -1;
        int arglen = atoi(p + 1);
        p = memchr(p, '\n', len - (p - buf));
        if (!p) return -1;
        p++;
        if (p + arglen > buf + len) return -1;
        argv[*argc] = malloc(arglen + 1);
        memcpy(argv[*argc], p, arglen);
        argv[*argc][arglen] = '\0';
        (*argc)++;
        p += arglen + 2; // skip \r\n
    }
    return p - buf;
}

static void free_argv(char *argv[], int argc) {
    for (int i = 0; i < argc; i++) free(argv[i]);
}

static void send_simple(int fd, const char *s) {
    char out[BUF_SIZE];
    int n = snprintf(out, sizeof(out), "+%s\r\n", s);
    write(fd, out, n);
}

static void send_bulk(int fd, const char *s) {
    char out[BUF_SIZE];
    int n = s ? snprintf(out, sizeof(out), "$%zu\r\n%s\r\n", strlen(s), s)
              : snprintf(out, sizeof(out), "$-1\r\n");
    write(fd, out, n);
}

static void send_int(int fd, int v) {
    char out[64];
    int n = snprintf(out, sizeof(out), ":%d\r\n", v);
    write(fd, out, n);
}

static void send_err(int fd, const char *msg) {
    char out[BUF_SIZE];
    int n = snprintf(out, sizeof(out), "-ERR %s\r\n", msg);
    write(fd, out, n);
}

static void handle_command(int fd, char *argv[], int argc) {
    if (argc == 0) return;
    if (strcasecmp(argv[0], "PING") == 0) {
        send_simple(fd, argc > 1 ? argv[1] : "PONG");
    } else if (strcasecmp(argv[0], "SET") == 0 && argc == 3) {
        kv_set(argv[1], argv[2]);
        send_simple(fd, "OK");
    } else if (strcasecmp(argv[0], "GET") == 0 && argc == 2) {
        send_bulk(fd, kv_get(argv[1]));
    } else if (strcasecmp(argv[0], "DEL") == 0 && argc == 2) {
        send_int(fd, kv_del(argv[1]));
    } else {
        send_err(fd, "unknown command or wrong number of arguments");
    }
}

int main(void) {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr = {
        .sin_family = AF_INET,
        .sin_addr.s_addr = INADDR_ANY,
        .sin_port = htons(PORT),
    };
    if (bind(server_fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind");
        return 1;
    }
    listen(server_fd, MAX_CLIENTS);
    printf("credis listening on :%d\n", PORT);

    // ponytail: single process, one client at a time (blocking) — the hash
    // table lives in this process's memory, so no shared-memory/IPC needed.
    // Upgrade to select()/epoll if concurrent clients are ever required.
    while (1) {
        int client_fd = accept(server_fd, NULL, NULL);
        if (client_fd < 0) continue;

        char buf[BUF_SIZE];
        int len = 0;
        ssize_t n;
        while ((n = read(client_fd, buf + len, sizeof(buf) - len - 1)) > 0) {
            len += n;
            buf[len] = '\0';
            char *argv[16];
            int argc;
            int consumed = parse_command(buf, len, argv, &argc);
            if (consumed > 0) {
                handle_command(client_fd, argv, argc);
                free_argv(argv, argc);
                memmove(buf, buf + consumed, len - consumed);
                len -= consumed;
            }
        }
        close(client_fd);
    }
    return 0;
}
