#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

#define MAX_LINE 1024
#define MAX_ARGS 64

static char *read_line(void) {
    char *line = malloc(MAX_LINE);
    if (!fgets(line, MAX_LINE, stdin)) {
        free(line);
        return NULL;
    }
    line[strcspn(line, "\n")] = '\0';
    return line;
}

static int parse_args(char *line, char **args) {
    int count = 0;
    char *tok = strtok(line, " ");
    while (tok && count < MAX_ARGS - 1) {
        args[count++] = tok;
        tok = strtok(NULL, " ");
    }
    args[count] = NULL;
    return count;
}

int main(void) {
    char *args[MAX_ARGS];

    while (1) {
        printf("byo-shell> ");
        fflush(stdout);

        char *line = read_line();
        if (!line) break;
        if (strlen(line) == 0) { free(line); continue; }

        if (strcmp(line, "exit") == 0) { free(line); break; }

        parse_args(line, args);

        // TODO: handle built-ins (cd, pwd), pipes, redirection
        pid_t pid = fork();
        if (pid == 0) {
            execvp(args[0], args);
            perror("byo-shell");
            exit(1);
        } else if (pid > 0) {
            int status;
            waitpid(pid, &status, 0);
        } else {
            perror("fork");
        }

        free(line);
    }

    return 0;
}
