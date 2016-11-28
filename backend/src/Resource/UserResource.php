<?php
/**
 * Created by PhpStorm.
 * User: cdunnink
 * Date: 15-11-2016
 * Time: 09:37
 */

namespace App\Resource;

use App\AbstractResource;
use App\Entity\User;

/**
 * Class Resource
 * @package App
 */
class UserResource extends AbstractResource
{

    /**
     * @param $id
     *
     * @return string
     */
    public function get($id = null)
    {
        if ($id === null) {
            $users = $this->entityManager->getRepository('App\Entity\User')->findAll();
            $users = array_map(
                function ($user) {
                    return $user;
                },
                $users
            );

            return $users;
        } else {
            $user = $this->entityManager->getRepository('App\Entity\User')->findOneBy(
                array('id' => $id)
            );
            if ($user) {
                return $user;
            }
        }
        return null;
    }

    public function post( $arrProps )
    {
        $name = $arrProps['name'];
        $password = $arrProps['password'];
        $email = $arrProps['email'];
        $active = $arrProps['active'];

        if ( strlen( $name ) < 3 ) {
            throw new Exception("de gebruikernaam moet minimaal uit drie karakters bestaan");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("het emailadres is geen correct emailadres");
        }
        if ( strlen( $name ) < 3 ) {
            throw new Exception("de gebruikernaam moet minimaal uit drie karakters bestaan");
        }
        $userTmp = $this->entityManager->getRepository('App\Entity\User')->findOneBy( array('name' => $name ) );
        if ( $userTmp ) {
            throw new Exception("de gebruikernaam is al in gebruik");
        }
        $userTmp = $this->entityManager->getRepository('App\Entity\User')->findOneBy( array('email' => $email ) );
        if ( $userTmp ) {
            throw new Exception("het emailadres is al in gebruik");
        }
        if ( strlen( $password ) < 8 ) {
            throw new Exception("het wachtwoord moet minimaal uit acht karakters bestaan");
        }

        /** @var User $user */
        $user = new User();

        $user->setEmail($email);
        $user->setName($name);
        $user->setPassword( password_hash( $password, PASSWORD_DEFAULT) );
        $user->setActive($active);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->convertToArray($user);
    }

    public function put( $id, $arrProps )
    {
        $name = $arrProps['name'];
        $email = $arrProps['email'];

        // handle if $id is missing or $name or $email are valid etc.
        // return valid status code or throw an exception
        // depends on the concrete implementation
        // check on unique name and emailadres

        /** @var User $user */
        $user = $this->entityManager->find('App\Entity\User', $id);
        if ( $user === null )
            throw new \Exception("de te wijzigen gebruiker met id ".$id.", kan niet worden gevonden", E_ERROR );

        $user->setEmail($email);
        $user->setName($name);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->convertToArray($user);
    }

    public function delete( $id )
    {
        // handle if $id is missing or $name or $email are valid etc.
        // return valid status code or throw an exception
        // depends on the concrete implementation

        /** @var User $user */
        $user = $this->entityManager->find('App\Entity\User', $id);
        if ( $user === null )
            throw new \Exception("de te verwijderen gebruiker met id ".$id.", kan niet worden gevonden", E_ERROR );

        $this->entityManager->remove($user);;
        $this->entityManager->flush();

        return $user;
    }

    private function convertToArray(User $user)
    {
        return array(
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail()
        );

    }
}