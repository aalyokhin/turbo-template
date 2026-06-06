import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/')({
  component: NotesPage,
})

function NotesPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const notesQuery = useQuery(api.notes.list.queryOptions())

  const invalidate = () => queryClient.invalidateQueries({ queryKey: api.notes.list.key() })

  const createNote = useMutation(
    api.notes.create.mutationOptions({
      onSuccess: () => {
        setTitle('')
        setBody('')
        return invalidate()
      },
    })
  )

  const deleteNote = useMutation(
    api.notes.remove.mutationOptions({ onSuccess: invalidate })
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createNote.mutate({ title, body })
  }

  const notes = notesQuery.data?.notes ?? []

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>New note</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Input
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Optional body"
              />
            </div>
            <Button type="submit" disabled={createNote.isPending}>
              {createNote.isPending ? 'Adding…' : 'Add note'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Notes</h2>
        {notesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet. Add one above.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Body</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.title}</TableCell>
                  <TableCell className="text-muted-foreground">{note.body}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote.mutate({ id: note.id })}
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
