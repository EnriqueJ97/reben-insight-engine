import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Mail, UserPlus, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InviteTeamMembers = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Sistema de Invitaciones</span>
          </CardTitle>
          <CardDescription>
            Funcionalidad en desarrollo. Las tablas de invitaciones se han creado correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sistema de Invitaciones</h3>
            <p className="text-muted-foreground mb-4">
              Esta funcionalidad estará disponible una vez que se regeneren los tipos de TypeScript.
            </p>
            <Button 
              onClick={() => toast({ 
                title: "En desarrollo", 
                description: "La funcionalidad de invitaciones estará disponible pronto." 
              })}
            >
              <Mail className="h-4 w-4 mr-2" />
              Invitar Miembros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteTeamMembers;